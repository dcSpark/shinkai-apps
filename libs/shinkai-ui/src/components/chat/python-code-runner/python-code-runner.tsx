import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '../../button';
import { OutputRender } from './output-render';
import {
  PythonCodeRunnerWebWorkerMessage,
  RunResult,
} from './python-code-runner-web-worker';
import PythonRunnerWorker from './python-code-runner-web-worker?worker';

type PythonCodeRunnerProps = {
  code: string;
};

// Define more specific message types
type FetchPageMessage = {
  type: 'fetch-page-response';
  meta: string; // URL
};

type RunDoneMessage = {
  type: 'run-done';
  payload: RunResult;
};

type WorkerMessage = FetchPageMessage | RunDoneMessage;

// Type guard functions
function isFetchPageMessage(message: WorkerMessage): message is FetchPageMessage {
  return message.type === 'fetch-page-response';
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
        }, 30000);

        worker.onmessage = async (event: { data: WorkerMessage }) => {
          if (isFetchPageMessage(event.data)) {
            try {
              console.log('fetching page', event.data.meta);
              const url = event.data.meta;
              const response = await invoke<{ status: number; headers: Record<string, string[]>; body: string }>('fetch_page', { url });
              console.log('fetch response', response);
              worker.postMessage({
                type: 'fetch-page-sync-response',
                meta: url,
                payload: response,
              });
            } catch (error) {
              console.error('error fetching page', error);
              worker.postMessage({
                type: 'fetch-page-sync-response',
                meta: event.data.meta,
                payload: { status: 500, headers: {}, body: `Failed to fetch page: ${error}` },
              });
            }
          } else if (isRunDoneMessage(event.data)) {
            clearTimeout(timeout);
            console.log('worker event', event);
            resolve(event.data.payload);
          }
        };

        worker.onerror = (error: { message: string }) => {
          clearTimeout(timeout);
          console.log('worker error', error);
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
