import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
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
