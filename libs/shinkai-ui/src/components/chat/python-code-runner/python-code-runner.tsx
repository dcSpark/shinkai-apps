import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import {
  BaseDirectory,
  readTextFile,
  writeTextFile,
} from '@tauri-apps/plugin-fs';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '../../button';
import { OutputRender } from './output-render';
import { RunResult } from './python-code-runner-web-worker';
import PythonRunnerWorker from './python-code-runner-web-worker?worker';

// Utility function to create a delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type PythonCodeRunnerProps = {
  code: string;
};

type FileSystemEntry = {
  path: string;
  timestamp: Date;
  mode: number;
  type: 'file' | 'folder';
};

// Define more specific message types
type PageMessage = {
  type: 'page';
  method: 'GET' | 'POST'; // New field to specify the method
  meta: string; // URL
  headers: Record<string, string>; // Headers
  body?: string; // Optional body content for POST
  sharedBuffer: SharedArrayBuffer;
};

type RunDoneMessage = {
  type: 'run-done';
  payload: RunResult;
};

type FsOperationMessage = {
  type: 'fs-operation';
  operation: 'open' | 'read' | 'write' | 'close';
  path: string;
  flags?: number;
  mode?: number;
  data?: Uint8Array;
};

type GetRemoteSetMessage = {
  type: 'get-remote-set';
  mount: any;
  sharedBuffer: SharedArrayBuffer;
};

type ReconcileMessage = {
  type: 'sync-local-to-remote';
  create: Record<string, FileSystemEntry>;
  remove: Record<string, FileSystemEntry>;
  sharedBuffer: SharedArrayBuffer;
};

type WorkerMessage = PageMessage | RunDoneMessage | FsOperationMessage | GetRemoteSetMessage | ReconcileMessage;

// Type guard functions
function isPageMessage(message: WorkerMessage): message is PageMessage {
  return message.type === 'page';
}

function isRunDoneMessage(message: WorkerMessage): message is RunDoneMessage {
  return message.type === 'run-done';
}

function isFsOperationMessage(
  message: WorkerMessage,
): message is FsOperationMessage {
  return message.type === 'fs-operation';
}

// Define the structure for our virtual file system
type VirtualFileSystem = {
  [path: string]: {
    content: string;
    isDirectory: boolean;
    lastModified: number;
  };
};

// Initialize our virtual file system
let virtualFS: VirtualFileSystem = {};

// Function to save the virtual file system state
async function saveVFSState() {
  const jsonState = JSON.stringify(virtualFS);
  await writeTextFile('vfs.json', jsonState, { baseDir: BaseDirectory.AppData });
}

// Function to load the virtual file system state
async function loadVFSState() {
  try {
    const jsonState = await readTextFile('vfs.json', {
      baseDir: BaseDirectory.AppData,
    });
    virtualFS = JSON.parse(jsonState);
  } catch (error) {
    console.log('No previous VFS state found, initializing empty state');
    virtualFS = {};
  }
}

// Load the VFS state when the component mounts
// loadVFSState();

// Mock remote storage implementation
const mockRemoteStorage = (() => {
  const storage: Record<string, { timestamp: number; mode: number }> = {};

  return {
    async keys(): Promise<string[]> {
      return Object.keys(storage);
    },
    async getItem(key: string): Promise<{ timestamp: number; mode: number }> {
      if (key in storage) {
        return storage[key];
      }
      throw new Error(`Key not found: ${key}`);
    },
    async setItem(key: string, value: { timestamp: number; mode: number }) {
      storage[key] = value;
    },
    async removeItem(key: string) {
      delete storage[key];
    },
  };
})();

const pathJoin = (base: string, relative: string) => `${base}/${relative}`;

export const usePythonRunnerRunMutation = (
  options?: UseMutationOptions<RunResult, Error, { code: string }>,
) => {
  const response = useMutation({
    mutationFn: async (params: { code: string }): Promise<RunResult> => {
      const worker = new PythonRunnerWorker();

      return new Promise<RunResult>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('execution timed out'));
        }, 120000); // 2 minutes

        worker.onmessage = async (event: { data: WorkerMessage }) => {
          console.log('main thread> received message: ', event);
          if (isPageMessage(event.data)) {
            const {
              method,
              meta: url,
              headers,
              body,
              sharedBuffer,
            } = event.data;
            console.log(`main thread> ${method.toLowerCase()}ing page`, url);
            console.log('main thread> headers: ', headers);

            const syncArray = new Int32Array(sharedBuffer, 0, 1);
            const dataArray = new Uint8Array(sharedBuffer, 4);

            const bufferSize = 512 * 1024; // Start with 512Kb
            const maxBufferSize = 100 * 1024 * 1024; // Set a maximum buffer size, e.g., 100MB
            let success = false;

            while (bufferSize <= maxBufferSize && !success) {
              try {
                console.log(
                  `main thread> ${method.toLowerCase()}ing page`,
                  url,
                );
                const response = await invoke<{
                  status: number;
                  headers: Record<string, string[]>;
                  body: string;
                }>(method === 'GET' ? 'get_request' : 'post_request', {
                  url,
                  customHeaders: JSON.stringify(headers),
                  ...(method === 'POST' && { body: JSON.stringify(body) }), // Ensure body is a string
                });
                console.log(
                  `main thread> ${method.toLowerCase()} response`,
                  response,
                );

                if (response.status >= 200 && response.status < 300) {
                  const textEncoder = new TextEncoder();
                  const encodedData = textEncoder.encode(response.body);

                  console.log('Required buffer size:', encodedData.length); // Log the required buffer size

                  let offset = 0;
                  while (offset < encodedData.length) {
                    const chunkSize = Math.min(
                      dataArray.length,
                      encodedData.length - offset,
                    );
                    dataArray.set(
                      encodedData.subarray(offset, offset + chunkSize),
                    );
                    offset += chunkSize;

                    // Indicate that a chunk is ready
                    syncArray[0] = 2; // New number to indicate chunk ready
                    console.log(
                      'main thread> Notifying Atomics with chunk ready',
                    );
                    Atomics.notify(syncArray, 0);

                    // Polling loop to wait for the other end to be ready for the next chunk
                    while (syncArray[0] === 2) {
                      await delay(25); // Wait for 25ms before checking again
                    }
                  }

                  // Indicate success after all chunks are sent
                  syncArray[0] = 1; // Indicate success
                  console.log('main thread> Notifying Atomics with success');
                  Atomics.notify(syncArray, 0);
                  success = true;
                } else {
                  throw new Error(`HTTP Error: ${response.status}`);
                }
              } catch (error) {
                let errorMessage = 'Unknown error';
                if (error instanceof Error) {
                  errorMessage = error.message;
                }
                console.error(
                  `main thread> error using ${method.toLowerCase()} with page`,
                  errorMessage,
                );

                const textEncoder = new TextEncoder();
                const encodedError = textEncoder.encode(errorMessage);

                if (encodedError.length <= dataArray.length) {
                  dataArray.set(encodedError);
                } else {
                  console.warn('Error message too long to fit in buffer');
                }

                console.log('main thread> Notifying Atomics with error');
                syncArray[0] = -1; // Indicate error
                Atomics.notify(syncArray, 0);

                // Await the delay before rejecting
                await delay(10);
                reject(
                  new Error(
                    `Failed to ${method.toLowerCase()} page: ` + errorMessage,
                  ),
                );
                return; // Exit the loop and function after rejection
              }
            }
          } else if (isRunDoneMessage(event.data)) {
            clearTimeout(timeout);
            console.log('main thread> worker event', event);
            resolve(event.data.payload);
          } else if (isFsOperationMessage(event.data)) {
            console.log('main thread> fs-operation message', event.data);
            const { operation, path, flags, mode, data } = event.data;
            try {
              switch (operation) {
                case 'open':
                  console.log(`Main thread> Opening file: ${path}`);
                  if (!virtualFS[path]) {
                    virtualFS[path] = {
                      content: '',
                      isDirectory: false,
                      lastModified: Date.now(),
                    };
                  }
                  break;
                case 'read':
                  console.log(`Main thread> Reading file: ${path}`);
                  if (virtualFS[path] && !virtualFS[path].isDirectory) {
                    // Send file content back to worker
                    worker.postMessage({
                      type: 'fs-response',
                      operation: 'read',
                      path,
                      content: virtualFS[path].content,
                    });
                  } else {
                    throw new Error(
                      `File not found or is a directory: ${path}`,
                    );
                  }
                  break;
                case 'write':
                  console.log(`Main thread> Writing to file: ${path}`);
                  if (data) {
                    const decoder = new TextDecoder();
                    const content = decoder.decode(data);
                    virtualFS[path] = {
                      content,
                      isDirectory: false,
                      lastModified: Date.now(),
                    };
                    saveVFSState(); // Persist changes
                  }
                  break;
                case 'close':
                  console.log(`Main thread> Closing file: ${path}`);
                  // No action needed for close in our simple implementation
                  break;
                default:
                  console.error(`Main thread> Unknown operation: ${operation}`);
              }
            } catch (error) {
              console.error(
                `Main thread> Error handling fs-operation: ${error}`,
              );
              worker.postMessage({
                type: 'fs-response',
                operation,
                path,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            }
          // Filesystem operations
          } else if (event.data.type === 'get-remote-set') {
            const { mount, sharedBuffer } = event.data;
            console.log('main thread> Getting remote set');
            console.log('main thread> event.data', event.data);
            const entries = Object.create(null);
            const storagePrefix = 'customFS_';

            const syncArray = new Int32Array(sharedBuffer, 0, 1);
            const dataArray = new Uint8Array(sharedBuffer, 4);

            try {
              const keys = await mockRemoteStorage.keys();
              for (const key of keys) {
                if (key.startsWith(storagePrefix)) {
                  const relativePath = key.slice(storagePrefix.length);
                  const item = await mockRemoteStorage.getItem(key);
                  entries[pathJoin(mount.mountpoint, relativePath)] = {
                    timestamp: new Date(item.timestamp),
                    mode: item.mode,
                  };
                }
              }

              const textEncoder = new TextEncoder();
              const encodedEntries = textEncoder.encode(JSON.stringify(entries));

              console.log('Encoded entries:', JSON.stringify(entries)); // Log the response

              if (encodedEntries.length <= dataArray.length) {
                dataArray.set(encodedEntries);
                syncArray[0] = 1; // Indicate success
              } else {
                console.warn('Encoded entries too large for buffer');
                syncArray[0] = -1; // Indicate error
              }
            } catch (error) {
              console.error('Error getting remote set:', error);
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              const encodedError = new TextEncoder().encode(errorMessage);

              if (encodedError.length <= dataArray.length) {
                dataArray.set(encodedError);
              } else {
                console.warn('Error message too long to fit in buffer');
              }
              syncArray[0] = -1; // Indicate error
            }

            Atomics.notify(syncArray, 0); // Notify the worker
          } else if (event.data.type === 'sync-local-to-remote') {
            const { create, remove, sharedBuffer } = event.data;
            console.log('main thread> Reconciling file system');
            console.log('main thread> create', JSON.stringify(create, null, 2)); // Pretty print the create object
            console.log('main thread> remove', JSON.stringify(remove, null, 2)); // Pretty print the remove object

            const syncArray = new Int32Array(sharedBuffer, 0, 1);
            const dataArray = new Uint8Array(sharedBuffer, 4);

            try {
              // Process create entries
              for (const path in create) {
                const entry = create[path];
                console.log(`main thread> Creating entry: ${path}`);
                // Use mockRemoteStorage to create entries
                await mockRemoteStorage.setItem(`customFS_${path}`, {
                  timestamp: new Date(entry.timestamp).getTime(),
                  mode: entry.mode,
                });
              }

              // Process remove entries
              for (const path in remove) {
                console.log(`main thread> Removing entry: ${path}`);
                // Use mockRemoteStorage to remove entries
                await mockRemoteStorage.removeItem(`customFS_${path}`);
              }

              const textEncoder = new TextEncoder();
              const successMessage = 'Reconciliation successful';
              const encodedMessage = textEncoder.encode(successMessage);

              if (encodedMessage.length <= dataArray.length) {
                dataArray.set(encodedMessage);
                syncArray[0] = 1; // Indicate success
              } else {
                console.warn('Success message too large for buffer');
                syncArray[0] = -1; // Indicate error
              }
            } catch (error) {
              console.error('Error during reconciliation:', error);
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              const encodedError = new TextEncoder().encode(errorMessage);

              if (encodedError.length <= dataArray.length) {
                dataArray.set(encodedError);
              } else {
                console.warn('Error message too long to fit in buffer');
              }
              syncArray[0] = -1; // Indicate error
            }

            Atomics.notify(syncArray, 0); // Notify the worker
          }
        };

        worker.onerror = (error: { message: string }) => {
          console.log('worker error', error);
          clearTimeout(timeout);
          reject(new Error(`worker error: ${error.message}`));
        };

        worker.postMessage({ type: 'run', payload: { code: params.code } });
      }).finally(() => {
        worker.terminate();
      });
    },
    ...options,
    onSuccess: (...onSuccessParameters) => {
      if (options?.onSuccess) {
        options.onSuccess(...onSuccessParameters);
      }
    },
  });
  return { ...response };
};

export const PythonCodeRunner = ({ code }: PythonCodeRunnerProps) => {
  const i18n = useTranslation();
  const {
    mutateAsync: run,
    data: runResult,
    isPending,
  } = usePythonRunnerRunMutation();
  return (
    <div className="mt-4">
      <Button
        className="h-8 min-w-[160px] cursor-pointer justify-start rounded-md border border-[#63676c] px-4 text-gray-50 hover:border-white hover:bg-transparent"
        disabled={isPending}
        isLoading={isPending}
        onClick={() => {
          run({ code });
        }}
        size={'sm'}
        variant="outline"
      >
        {isPending ? null : (
          <svg
            className="mr-2 h-4 w-4"
            fill="currentColor"
            height="1em"
            stroke="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            width="1em"
          >
            <path
              d="M112 111v290c0 17.44 17 28.52 31 20.16l247.9-148.37c12.12-7.25 12.12-26.33 0-33.58L143 90.84c-14-8.36-31 2.72-31 20.16z"
              fill="none"
              strokeMiterlimit="10"
              strokeWidth="32"
            />
          </svg>
        )}
        <span className="text-xs font-semibold text-gray-50">
          {i18n.t('codeRunner.executeCode')}
        </span>
      </Button>
      <AnimatePresence>
        {!isPending && runResult && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-2"
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <OutputRender result={runResult} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
