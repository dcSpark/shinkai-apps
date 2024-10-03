import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { Play } from 'lucide-react';
import { useState } from 'react';
import Plot from 'react-plotly.js';

import { Button } from '../button';

type PythonCodeRendererProps = {
  code: string;
};

export const usePythonRunnerRunMutation = (
  options?: UseMutationOptions<any, Error, { code: string }>,
) => {
  const response = useMutation({
    mutationFn: async (params: { code: string }): Promise<any> => {
      return invoke('python_runner_run', { code: params.code });
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
    <div className="mt-4">
      <button
        className="flex items-center text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="mr-2">{isExpanded ? '▼' : '▶'}</span>
        {isExpanded ? 'Hide' : 'Show'} stdout ({stdout.length} lines)
      </button>
      {isExpanded && (
        <pre className="mt-2 max-h-60 overflow-y-auto rounded-md bg-gray-100 p-4 text-sm">
          {stdout.join('\n')}
        </pre>
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

const ResultRender = ({ result }: { result: any }) => {
  if (result?.state === 'error') {
    return (
      <div className="flex flex-col space-y-2">
        <ErrorRender error={result.payload} />
        <StdoutRender stdout={result.stdout || []} />
        <StderrRender stderr={result.stderr || []} />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      {result?.payload?.type === 'plotly' ? (
        <Plot
          config={{ responsive: true }}
          data={result.payload.data.data}
          layout={{ title: 'A Fancy Plot' }}
        />
      ) : (
        <div className="rounded-md bg-gray-100 p-4">
          <h3 className="mb-2 font-bold">Result:</h3>
          <pre className="overflow-x-auto whitespace-pre-wrap">
            {result.payload.data}
          </pre>
        </div>
      )}
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
        disabled={isPending}
        isLoading={isPending}
        onClick={() => {
          run({ code });
        }}
        size={'icon'}
        variant={'secondary'}
      >
        <Play />
      </Button>
      {!isPending && data && (
        <div className="mt-2">
          <ResultRender result={data} />
        </div>
      )}
    </div>
  );
};

export default PythonCodeRenderer;
