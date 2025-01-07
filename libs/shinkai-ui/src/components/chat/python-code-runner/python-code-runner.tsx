import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { addFileToJob } from '@shinkai_network/shinkai-message-ts/api/jobs/index';
import { useGetDownloadFile } from '@shinkai_network/shinkai-node-state/v2/queries/getDownloadFile/useGetDownloadFile';
import { useGetJobContents } from '@shinkai_network/shinkai-node-state/v2/queries/getJobContents/useGetJobContents';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { AnimatePresence, motion } from 'framer-motion';
import { loadPyodide, PyodideInterface } from 'pyodide';
import React, { useCallback, useEffect, useState } from 'react';

import { Button } from '../../button';
import { OutputRender } from './output-render';
import { RunResult } from './python-code-runner-web-worker';
import PythonRunnerWorker from './python-code-runner-web-worker?worker';

// Utility function to create a delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Pyodide instance in the main thread
let pyodideMain: PyodideInterface | null = null;

// Function to initialize Pyodide in the main thread
async function initPyodideInMainThread() {
  if (pyodideMain) {
    console.log('Pyodide is already initialized in main thread.');
    return;
  }

  console.time('initialize main thread pyodide');
  pyodideMain = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
    stdout: console.log,
    stderr: console.error,
  });
  console.log('Pyodide initialized in main thread');

  // Mount IDBFS to the same path as the worker
  try {
    if (!pyodideMain) return;
    
    pyodideMain.FS.mount(
      pyodideMain.FS.filesystems.IDBFS,
      {},
      '/home/pyodide'
    );

    // Sync FROM IDB (true) to pull anything stored by the worker
    await new Promise<void>((resolve, reject) => {
      if (!pyodideMain) {
        reject(new Error('Pyodide not initialized'));
        return;
      }
      
      pyodideMain.FS.syncfs(true, (err: Error | null) => {
        if (err) {
          console.error('Failed to sync from IndexedDB:', err);
          reject(err);
        } else {
          console.log('Successfully synced from IndexedDB');
          resolve();
        }
      });
    });

    // List the directory contents
    const contents = pyodideMain.FS.readdir('/home/pyodide');
    console.log('Main thread sees /home/pyodide contents:', contents);
  } catch (error) {
    console.error('Failed to set up IDBFS in main thread:', error);
  }

  console.timeEnd('initialize main thread pyodide');
}

type FileSystemEntry = {
  name: string;
  type: 'directory' | 'file';
  content?: string;
  contents?: FileSystemEntry[];
  mtimeMs?: number;
};

// Function to read IDBFS contents
function readIDBFSContents(path: string): FileSystemEntry[] | null {
  if (!pyodideMain) {
    console.error('Pyodide not initialized in main thread');
    return null;
  }

  try {
    const entries = pyodideMain.FS.readdir(path);
    const contents = entries.filter((entry: string) => 
      entry !== '.' && entry !== '..' && entry !== '.matplotlib' // Ignore these entries
    );
    
    const result = contents.map((entry: string) => {
      const fullPath = `${path}/${entry}`;
      const stat = pyodideMain?.FS.stat(fullPath);
      const isDirectory = stat && pyodideMain?.FS.isDir(stat.mode);
      
      if (isDirectory) {
        return { 
          name: entry, 
          type: 'directory' as const, 
          contents: readIDBFSContents(fullPath) 
        };
      } else {
        const content = pyodideMain?.FS.readFile(fullPath, { encoding: 'utf8' });
        return { 
          name: entry, 
          type: 'file' as const, 
          content: content as string 
        };
      }
    });

    return result;
  } catch (error) {
    console.error(`Error reading ${path}:`, error);
    return null;
  }
}

// Function to read IDBFS contents with mtime
function readIDBFSContentsWithMtime(path: string): FileSystemEntry[] | null {
  if (!pyodideMain) {
    console.error('Pyodide not initialized in main thread');
    return null;
  }

  try {
    const entries = pyodideMain.FS.readdir(path);
    const contents = entries.filter((entry: string) => 
      entry !== '.' && entry !== '..' && entry !== '.matplotlib'
    );

    const result = contents.map((entry: string) => {
      const fullPath = `${path}/${entry}`;
      const stat = pyodideMain?.FS.stat(fullPath);
      const isDirectory = stat && pyodideMain?.FS.isDir(stat.mode);
      const mtimeMs = stat ? stat.mtime * 1000 : 0; // Convert mtime to milliseconds

      if (isDirectory) {
        return { 
          name: entry, 
          type: 'directory' as const, 
          contents: readIDBFSContentsWithMtime(fullPath) 
        };
      } else {
        const content = pyodideMain?.FS.readFile(fullPath, { encoding: 'utf8' });
        return { 
          name: entry, 
          type: 'file' as const, 
          content: content as string,
          mtimeMs
        };
      }
    });

    return result;
  } catch (error) {
    console.error(`Error reading ${path}:`, error);
    return null;
  }
}

type PythonCodeRunnerProps = {
  code: string;
  jobId: string;
  nodeAddress: string;
  token: string;
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

type WorkerMessage = PageMessage | RunDoneMessage;

// Type guard functions
function isPageMessage(message: WorkerMessage): message is PageMessage {
  return message.type === 'page';
}

function isRunDoneMessage(message: WorkerMessage): message is RunDoneMessage {
  return message.type === 'run-done';
}

export const usePythonRunnerRunMutation = (
  options?: UseMutationOptions<RunResult, Error, { code: string }>,
) => {
  const response = useMutation({
    mutationFn: async (params: { code: string }): Promise<RunResult> => {
      // Initialize Pyodide *only* if it's not already up
      if (!pyodideMain) {
        await initPyodideInMainThread();
      }

      const worker = new PythonRunnerWorker();

      return new Promise<RunResult>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('execution timed out'));
        }, 120000); // 2 minutes

        worker.onmessage = async (event: { data: WorkerMessage }) => {
          if (isPageMessage(event.data)) {
            const { method, meta: url, headers, body, sharedBuffer } = event.data;
            console.log(`main thread> ${method.toLowerCase()}ing page`, url);
            console.log('main thread> headers: ', headers);

            const syncArray = new Int32Array(sharedBuffer, 0, 1);
            const dataArray = new Uint8Array(sharedBuffer, 4);

            const bufferSize = 512 * 1024; // Start with 512Kb
            const maxBufferSize = 100 * 1024 * 1024; // Set a maximum buffer size, e.g., 100MB
            let success = false;

            while (bufferSize <= maxBufferSize && !success) {
              try {
                console.log(`main thread> ${method.toLowerCase()}ing page`, url);
                const response = await invoke<{
                  status: number;
                  headers: Record<string, string[]>;
                  body: string;
                }>(method === 'GET' ? 'get_request' : 'post_request', {
                  url,
                  customHeaders: JSON.stringify(headers),
                  ...(method === 'POST' && { body: JSON.stringify(body) }), // Ensure body is a string
                });
                console.log(`main thread> ${method.toLowerCase()} response`, response);

                if (response.status >= 200 && response.status < 300) {
                  const textEncoder = new TextEncoder();
                  const encodedData = textEncoder.encode(response.body);

                  console.log('Required buffer size:', encodedData.length); // Log the required buffer size

                  let offset = 0;
                  while (offset < encodedData.length) {
                    const chunkSize = Math.min(dataArray.length, encodedData.length - offset);
                    dataArray.set(encodedData.subarray(offset, offset + chunkSize));
                    offset += chunkSize;

                    // Indicate that a chunk is ready
                    syncArray[0] = 2; // New number to indicate chunk ready
                    console.log('main thread> Notifying Atomics with chunk ready');
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
                console.error(`main thread> error using ${method.toLowerCase()} with page`, errorMessage);

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
                reject(new Error(`Failed to ${method.toLowerCase()} page: ` + errorMessage));
                return; // Exit the loop and function after rejection
              }
            }
          } else if (isRunDoneMessage(event.data)) {
            clearTimeout(timeout);
            console.log('main thread> worker event', event);
            resolve(event.data.payload);
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

export const PythonCodeRunner = ({ code, jobId, nodeAddress, token }: PythonCodeRunnerProps) => {
  const i18n = useTranslation();
  const [isSyncing, setIsSyncing] = useState(false);
  
  const {
    mutateAsync: run,
    data: runResult,
    isPending,
  } = usePythonRunnerRunMutation();

  const { mutateAsync: downloadFile } = useGetDownloadFile();

  const { data: jobContents, isLoading: isLoadingJobContents } = useGetJobContents(
    {
      nodeAddress,
      token,
      jobId,
    },
    {
      enabled: !!nodeAddress && !!token && !!jobId,
    }
  );

  // Just log contents if needed, but don't auto-init Pyodide
  useEffect(() => {
    if (jobContents) {
      console.log('Job contents:', jobContents);
    }
  }, [jobContents]);

  // Function to read file content from IDBFS
  const readFileFromIDBFS = (filePath: string): string | undefined => {
    if (!pyodideMain) return undefined;
    try {
      return pyodideMain.FS.readFile(filePath, { encoding: 'utf8' });
    } catch (error) {
      console.error(`Failed to read file ${filePath}:`, error);
      return undefined;
    }
  };

  // Utility that checks if file contents differ by comparing byte length.
  function isFileChangedLocally(
    localContent: string | undefined,
    remoteFile: { size: number } | undefined
  ) {
    if (!localContent || !remoteFile) return true; 
    return localContent.length !== remoteFile.size;
  }

  // Utility: ensure subdirectories exist before writing a file
  function ensureDirExists(dirPath: string) {
    if (!pyodideMain) {
      console.error('Pyodide is not initialized.');
      return;
    }
    
    const fs = pyodideMain.FS;
    const parts = dirPath.split('/').filter(Boolean);
    let currentPath = '';
    for (const part of parts) {
      currentPath += '/' + part;
      try {
        fs.mkdir(currentPath);
      } catch (err) {
        // Ignore EEXIST
        if (!(err instanceof Error && err.message.includes('File exists'))) {
          throw err;
        }
      }
    }
  }

  // Recursively remove anything in IDBFS that is not in the job
  function removeStaleIDBFSItems(idbDirPath: string, jobPathsSet: Set<string>) {
    if (!pyodideMain) {
      console.error('Pyodide is not initialized.');
      return;
    }

    const fs = pyodideMain.FS;
    const entries = fs.readdir(idbDirPath);
    for (const entry of entries) {
      if (entry === '.' || entry === '..') continue;
      const fullPath = `${idbDirPath}/${entry}`;
      const stat = fs.stat(fullPath);
      if (fs.isDir(stat.mode)) {
        removeStaleIDBFSItems(fullPath, jobPathsSet); // recurse
        // If folder is not in jobPathsSet itself, remove it
        if (!jobPathsSet.has(fullPath)) {
          try {
            fs.rmdir(fullPath);
            console.log(`Removed directory ${fullPath} from IDBFS`);
          } catch (err) {
            console.error(`Failed removing directory ${fullPath}:`, err);
          }
        }
      } else {
        // If file is not in the job set, remove it
        if (!jobPathsSet.has(fullPath)) {
          try {
            fs.unlink(fullPath);
            console.log(`Removed file ${fullPath} from IDBFS`);
          } catch (err) {
            console.error(`Failed removing file ${fullPath}:`, err);
          }
        }
      }
    }
  }

  // Recursively mirror job files into /home/pyodide
  async function syncJobFilesToIDBFS() {
    if (!pyodideMain || !jobContents) {
      console.error('Pyodide is not initialized or job contents are missing.');
      return;
    }

    console.time('Sync Job Files to IDBFS');
    setIsSyncing(true);
    try {
      // Build a Set of all fullPaths from the job
      const jobPathsSet = new Set<string>();
      for (const remoteFile of jobContents) {
        const fullDirPath = `/home/pyodide/${remoteFile.path.replace(/^\//, '')}`;
        jobPathsSet.add(fullDirPath);
        if (!remoteFile.is_directory) {
          jobPathsSet.add(fullDirPath);
        }
      }

      // First, remove anything from IDBFS that is no longer in the job
      removeStaleIDBFSItems('/home/pyodide', jobPathsSet);

      // Next, add or update items from the job
      for (const remoteFile of jobContents) {
        const fullPath = `/home/pyodide/${remoteFile.path.replace(/^\//, '')}`;
        if (remoteFile.is_directory) {
          ensureDirExists(fullPath);
        } else {
          const dirOnly = fullPath.substring(0, fullPath.lastIndexOf('/'));
          ensureDirExists(dirOnly);
          await syncFileToIDBFS(remoteFile);
        }
      }

      // Finally, push changes to IDB
      await new Promise<void>((resolve, reject) => {
        pyodideMain?.FS.syncfs(false, (err: Error | null) => {
          if (err) {
            console.error('Failed to sync to IndexedDB:', err);
            reject(err);
          } else {
            console.log('Successfully synced all files to IndexedDB');
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Failed to sync job files:', error);
    } finally {
      setIsSyncing(false);
      console.timeEnd('Sync Job Files to IDBFS');
    }
  }

  // Recursive function to traverse directories and upload files
  async function traverseAndUpload(
    entries: FileSystemEntry[],
    basePath: string,
    timeBefore: number,
    nodeAddress: string,
    token: string,
    jobId: string
  ) {
    for (const entry of entries) {
      const fullPath = `${basePath}/${entry.name}`;
      if (entry.type === 'file' && entry.mtimeMs !== undefined) {
        const mtimeInMs = entry.mtimeMs;
        const mtimeISO = new Date(mtimeInMs).toISOString();
        const timeBeforeISO = new Date(timeBefore).toISOString();
        console.log(`Checking file: ${fullPath}, Modified Time: ${mtimeISO}, Time Before: ${timeBeforeISO}`);
        if (mtimeInMs > timeBefore) {
          console.log(`Uploading changed file: ${fullPath}`);
          try {
            const blob = new Blob([entry.content ?? ''], { type: 'text/plain' });
            const file = new File([blob], entry.name, { type: 'text/plain' });
            await addFileToJob(nodeAddress, token, {
              filename: fullPath.replace('/home/pyodide/', ''), // Adjust path for upload
              job_id: jobId,
              file,
            });
            console.log(`Successfully uploaded file: ${fullPath}`);
          } catch (error) {
            console.error(`Failed to upload file ${fullPath}:`, error);
          }
        } else {
          console.log(`No changes detected for file: ${fullPath}`);
        }
      } else if (entry.type === 'directory' && entry.contents) {
        // Recurse into subdirectory
        await traverseAndUpload(entry.contents, fullPath, timeBefore, nodeAddress, token, jobId);
      }
    }
  }

  // Function to compare and upload files based on mtime
  async function compareAndUploadFiles(timeBefore: number | null) {
    console.log('compareAndUploadFiles', timeBefore);
    if (!pyodideMain || !jobId || !nodeAddress || !token || !jobContents || !timeBefore) {
      console.warn('Missing required parameters for file comparison and upload.');
      return;
    }

    console.time('Compare and Upload Files');
    console.log('Starting file comparison and upload process.');
    try {
      const idbfsContents = readIDBFSContentsWithMtime('/home/pyodide');
      if (!idbfsContents) {
        console.warn('No contents found in /home/pyodide.');
        return;
      }

      // Start the recursive traversal from the root directory
      await traverseAndUpload(idbfsContents, '/home/pyodide', timeBefore, nodeAddress, token, jobId);
    } catch (error) {
      console.error('Failed to compare/upload files:', error);
    } finally {
      console.timeEnd('Compare and Upload Files');
      console.log('File comparison and upload process completed.');
    }
  }

  // Function to sync a single file from job to IDBFS
  const syncFileToIDBFS = async (item: { path: string; name: string }) => {
    if (!pyodideMain) return;

    try {
      // Download the file content
      const content = await downloadFile({
        nodeAddress,
        token,
        path: item.path,
      });

      // Write to IDBFS
      pyodideMain.FS.writeFile(`/home/pyodide/${item.name}`, content, { encoding: 'utf8' });
      console.log(`Synced file ${item.name} to IDBFS`);
    } catch (error) {
      console.error(`Failed to sync file ${item.name}:`, error);
    }
  };

  // Function to read and log IDBFS contents
  const handleReadIDBFS = useCallback(() => {
    if (!pyodideMain) {
      console.error('Pyodide not initialized in main thread');
      return;
    }

    const contents = readIDBFSContents('/home/pyodide');
    console.log('IDBFS contents:', contents);
  }, []);

  return (
    <div className="mt-4">
      <div className="flex gap-2">
        <Button
          className="h-8 min-w-[160px] cursor-pointer justify-start rounded-md border border-[#63676c] px-4 text-gray-50 hover:border-white hover:bg-transparent"
          disabled={isPending}
          isLoading={isPending}
          onClick={async () => {
            const timeBefore = Date.now(); // Use a regular variable to store the timestamp
            console.log('Executing Python code.');
            
            // 1) Run the Python code in the worker
            await run({ code });
            console.log('Python code execution completed.');

            // 2) Pull the latest FS changes from the worker into main thread
            if (pyodideMain) {
              console.log('Now syncing from IndexedDB (pulling changes from worker).');
              await new Promise<void>((resolve, reject) => {
                if (pyodideMain) {
                  pyodideMain.FS.syncfs(true, (err: Error | null) => {
                    if (err) {
                      console.error('Failed to sync from IndexedDB after Python code run:', err);
                      reject(err);
                    } else {
                      console.log('Successfully synced from IndexedDB after Python code run.');
                      resolve();
                    }
                  });
                } else {
                  console.warn('pyodideMain became null, skipping sync operation.');
                  reject(new Error('pyodideMain is null'));
                }
              });
            } else {
              console.warn('pyodideMain is null, skipping sync operation.');
            }

            // 3) Now check for changed files in IDBFS and upload them
            console.log('Starting file comparison and upload.');
            await compareAndUploadFiles(timeBefore);
            console.log('File sync completed.');
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
        <Button
          className="h-8 cursor-pointer justify-start rounded-md border border-[#63676c] px-4 text-gray-50 hover:border-white hover:bg-transparent"
          onClick={handleReadIDBFS}
          size={'sm'}
          variant="outline"
        >
          <span className="text-xs font-semibold text-gray-50">
            Read IDBFS
          </span>
        </Button>
        <Button
          className="h-8 cursor-pointer justify-start rounded-md border border-[#63676c] px-4 text-gray-50 hover:border-white hover:bg-transparent"
          disabled={isSyncing || !jobContents?.length}
          isLoading={isSyncing}
          onClick={syncJobFilesToIDBFS}
          size={'sm'}
          variant="outline"
        >
          <span className="text-xs font-semibold text-gray-50">
            {isSyncing ? 'Syncing...' : 'Sync Job Files'}
          </span>
        </Button>
      </div>
      
      {/* Display job contents */}
      {isLoadingJobContents ? (
        <div className="mt-2 text-sm text-gray-400">Loading job contents...</div>
      ) : jobContents && jobContents.length > 0 ? (
        <div className="mt-2">
          <div className="text-sm font-medium text-gray-200 mb-2">Job Files:</div>
          <ul className="mt-1 space-y-2">
            {jobContents.map((item, index) => (
              <li className="text-sm text-gray-400 bg-gray-800/30 p-2 rounded-md" key={index}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="ml-2 text-gray-500">({item.is_directory ? 'Directory' : 'File'})</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {!item.is_directory && (
                      <span>{(item.size / 1024).toFixed(1)} KB</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1 flex gap-3">
                  <span>Created: {new Date(item.created_time).toLocaleString()}</span>
                  <span>Modified: {new Date(item.modified_time).toLocaleString()}</span>
                  {item.has_embeddings && (
                    <span className="text-emerald-500/70">Has Embeddings</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      
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
