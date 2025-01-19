import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { addFileToJob } from '@shinkai_network/shinkai-message-ts/api/jobs/index';
import { DirectoryContent } from '@shinkai_network/shinkai-message-ts/api/vector-fs/types';
import { useGetDownloadFile } from '@shinkai_network/shinkai-node-state/v2/queries/getDownloadFile/useGetDownloadFile';
import { useGetJobContents } from '@shinkai_network/shinkai-node-state/v2/queries/getJobContents/useGetJobContents';
import { Button } from '@shinkai_network/shinkai-ui';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { usePyodideInstance } from './hooks/usePyodideInstance';
import { OutputRender } from './output-render';
import { RunResult } from './python-code-runner-web-worker';
import PythonRunnerWorker from './python-code-runner-web-worker?worker';
import { FileSystemEntry } from './services/file-system-service';
import { JobService } from './services/job-service';

// Utility function to create a delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type PythonCodeRunnerProps = {
  code: string;
  jobId: string;
  nodeAddress: string;
  token: string;
};

// Define more specific message types
type PageMessage = {
  type: 'page';
  method: 'GET' | 'POST';
  meta: string;
  headers: Record<string, string>;
  body?: string;
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
      const worker = new PythonRunnerWorker();

      return new Promise<RunResult>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('execution timed out'));
        }, 120000); // 2 minutes

        worker.onmessage = async (event: { data: WorkerMessage }) => {
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

            const bufferSize = 512 * 1024;
            const maxBufferSize = 100 * 1024 * 1024;
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
                  ...(method === 'POST' && { body: JSON.stringify(body) }),
                });
                console.log(
                  `main thread> ${method.toLowerCase()} response`,
                  response,
                );

                if (response.status >= 200 && response.status < 300) {
                  const textEncoder = new TextEncoder();
                  const encodedData = textEncoder.encode(response.body);

                  console.log('Required buffer size:', encodedData.length);

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

                    syncArray[0] = 2;
                    console.log(
                      'main thread> Notifying Atomics with chunk ready',
                    );
                    Atomics.notify(syncArray, 0);

                    while (syncArray[0] === 2) {
                      await delay(25);
                    }
                  }

                  syncArray[0] = 1;
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
                syncArray[0] = -1;
                Atomics.notify(syncArray, 0);

                await delay(10);
                reject(
                  new Error(
                    `Failed to ${method.toLowerCase()} page: ` + errorMessage,
                  ),
                );
                return;
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

// Define a function to transform DirectoryContent to FileSystemEntry
function transformToFileSystemEntry(
  contents: DirectoryContent[],
): FileSystemEntry[] {
  return contents.map((entry) => ({
    name: entry.name,
    type: entry.is_directory ? 'directory' : 'file',
    content: undefined,
    contents: entry.is_directory
      ? transformToFileSystemEntry(entry.children || [])
      : undefined,
    mtimeMs: new Date(entry.modified_time).getTime(),
  }));
}

export const PythonCodeRunner = ({
  code,
  jobId,
  nodeAddress,
  token,
}: PythonCodeRunnerProps) => {
  const i18n = useTranslation();
  // @ts-expect-error unused-vars
  const [isSyncing, setIsSyncing] = useState(false);
  // @ts-expect-error unused-vars
  const [jobContents, setJobContents] = useState<FileSystemEntry[] | null>(
    null,
  );

  const {
    mutateAsync: run,
    data: runResult,
    isPending,
  } = usePythonRunnerRunMutation();

  const { mutateAsync: downloadFile } = useGetDownloadFile();

  const { data: fetchedJobContents, refetch: refetchJobContents } =
    useGetJobContents(
      {
        nodeAddress,
        token,
        jobId,
      },
      {
        enabled: false,
      },
    );
  // @ts-expect-error unused-vars
  const { pyodide, fileSystemService, initializePyodide } =
    usePyodideInstance();

  useEffect(() => {
    if (fetchedJobContents) {
      const transformedContents =
        transformToFileSystemEntry(fetchedJobContents);
      setJobContents(transformedContents);
    }
  }, [fetchedJobContents]);

  return (
    <div className="mt-4">
      <div className="flex gap-2">
        <Button
          className="h-8 min-w-[160px] cursor-pointer justify-start rounded-md border border-[#63676c] px-4 text-gray-50 hover:border-white hover:bg-transparent"
          disabled={isPending}
          isLoading={isPending}
          onClick={async () => {
            try {
              // 1. First ensure we have job contents
              console.log('Fetching job contents...');
              const jobContentsResult = await refetchJobContents();
              // @ts-expect-error unused-vars
              const transformedContents = jobContentsResult.data
                ? transformToFileSystemEntry(jobContentsResult.data)
                : null;

              // 2. Initialize Pyodide and get services
              console.log('Ensuring Pyodide is initialized...');
              const { fileSystemService } = await initializePyodide();

              // 3. Create JobService instance
              const jobService = new JobService({
                fileSystemService,
                downloadFile: ({ nodeAddress, token, path }) =>
                  downloadFile({ nodeAddress, token, path }),
                addFileToJob,
                nodeAddress,
                token,
                jobId,
              });

              // 4. Sync files and run code
              setIsSyncing(true);
              try {
                await jobService.syncJobFilesToIDBFS(
                  jobContentsResult.data || null,
                );

                const timeBefore = Date.now();
                console.log('Executing Python code...');
                await run({ code });
                console.log('Python code execution completed.');

                if (fileSystemService) {
                  await fileSystemService.syncFromIndexedDB();
                  await jobService.compareAndUploadFiles(timeBefore);
                }
              } finally {
                setIsSyncing(false);
              }
            } catch (error) {
              console.error('Failed to execute Python code:', error);
            }
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
      </div>

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
