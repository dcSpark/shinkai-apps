import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import Plot from 'react-plotly.js';

// TODO: Refactor this import, we shouldn't importing an external script
// eslint-disable-next-line @nx/enforce-module-boundaries
import PythonRunnerWorker from '../../../../../apps/shinkai-desktop/src/workers/python-runner-worker?worker';
import { Button } from '../button';

type PythonCodeRendererProps = {
  code: string;
};

type RunResult =
  | {
      state: 'success';
      stdout: string[];
      stderr: string[];
      result: {
        rawOutput: string;
        figures: { type: 'plotly' | 'html'; data: string }[];
      };
    }
  | {
      state: 'error';
      stdout: string[];
      stderr: string[];
      message: string;
    };

export const usePythonRunnerRunMutation = (
  options?: UseMutationOptions<RunResult, Error, { code: string }>,
) => {
  const response = useMutation({
    mutationFn: async (params: { code: string }): Promise<any> => {
      const worker = new PythonRunnerWorker();
      worker.postMessage({ type: 'run', payload: { code: params.code } });
      const result: RunResult = await new Promise<RunResult>(
        (resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('execution timed out'));
          }, 30000); // 30 seconds timeout
          worker.onmessage = (event: {
            data: { type: string; payload: RunResult | PromiseLike<RunResult> };
          }) => {
            if (event.data.type === 'run-done') {
              clearTimeout(timeout);
              console.log('worker event', event);
              resolve(event.data.payload);
            }
          };
          worker.onerror = (error: { message: any }) => {
            clearTimeout(timeout);
            console.log('worker error', error);
            reject(new Error(`worker error: ${error.message}`));
          };
        },
      ).finally(() => {
        worker.terminate();
      });
      console.log('mutation run result', result);
      return result;
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

const StdoutRender = ({ stdout }: { stdout: string[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (stdout.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 rounded-md border border-gray-200 bg-gray-50">
      <button
        className="flex w-full items-center justify-between p-3 text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-100 focus:outline-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="flex items-center">
          <span
            className={`mr-2 transition-transform duration-200 ${isExpanded ? 'rotate-90 transform' : ''}`}
          >
            ▶
          </span>
          Stdout ({stdout.length} line{stdout.length !== 1 ? 's' : ''})
        </span>
        <span className="text-gray-500">{isExpanded ? 'Hide' : 'Show'}</span>
      </button>
      {isExpanded && (
        <div className="border-t border-gray-200">
          <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap break-words p-4 text-sm text-gray-800">
            {stdout.map((line, index) => (
              <div className="mb-1 last:mb-0" key={index}>
                <span className="mr-2 select-none text-gray-500">
                  {index + 1}
                </span>
                {line}
              </div>
            ))}
          </pre>
        </div>
      )}
    </div>
  );
};

const StderrRender = ({ stderr }: { stderr: string[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (stderr.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-red-700">Stderr</h3>
        <button
          className="text-sm text-red-600 transition-colors duration-200 hover:text-red-800 focus:outline-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide' : 'Show'} ({stderr.length})
          <span className="ml-1">{isExpanded ? '▲' : '▼'}</span>
        </button>
      </div>
      {isExpanded && (
        <div className="mt-2 max-h-60 overflow-y-auto">
          {stderr.map((error: string, index: number) => (
            <div className="mb-2 text-red-600 last:mb-0" key={index}>
              <span className="mr-2 rounded bg-red-100 px-1 py-0.5 font-mono">
                {index + 1}
              </span>
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ErrorRender = ({ error }: { error: string }) => {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-4">
      <div className="mb-2 flex items-center">
        <ExclamationTriangleIcon className="mr-2 h-5 w-5 text-red-600" />
        <h3 className="font-bold text-red-700">Error Occurred</h3>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap rounded border border-red-100 bg-white p-3 text-sm text-red-800">
        {error}
      </pre>
    </div>
  );
};

const ResultRender = ({ result }: { result: RunResult }) => {
  if (result?.state === 'error') {
    return (
      <div className="flex flex-col space-y-2">
        <ErrorRender error={result.message} />
        <StdoutRender stdout={result.stdout || []} />
        <StderrRender stderr={result.stderr || []} />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-col space-y-2">
        {result?.result?.figures?.map((figure, index) => {
          return figure.type === 'plotly' ? (
            <div className="mb-4" key={index}>
              <Plot
                config={{
                  responsive: true,
                  displayModeBar: true,
                  scrollZoom: false,
                }}
                data={JSON.parse(figure.data).data}
                layout={{
                  ...JSON.parse(figure.data).layout,
                  autosize: true,
                  margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
                  width: '100%',
                  height: 400,
                }}
                style={{ width: '100%', height: '100%' }}
                useResizeHandler={true}
              />
            </div>
          ) : (
            <div
              dangerouslySetInnerHTML={{ __html: figure.data }}
              key={index}
            />
          );
        })}
      </div>

      <details className="rounded-md bg-gray-100 p-4">
        <summary className="mb-2 cursor-pointer font-bold">Output:</summary>
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">
          {result.result.rawOutput}
        </pre>
      </details>
      <StdoutRender stdout={result.stdout || []} />
    </div>
  );
};

const PythonCodeRenderer = ({ code }: PythonCodeRendererProps) => {
  const { mutateAsync: run, data, isPending } = usePythonRunnerRunMutation();
  console.log('run result', data);
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
        <span className="text-xs font-semibold text-gray-50">Execute Code</span>
      </Button>
      <AnimatePresence>
        {!isPending && data && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-2"
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ResultRender result={data} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PythonCodeRenderer;
