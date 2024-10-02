import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from 'react';

interface LoadingProgress {
  step: string;
  progress: number;
}

const usePythonRunnerRunMutation = (
  options?: UseMutationOptions<
    any,
    Error,
    { code: string }
  >,
) => {
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress[]>([]);

  useEffect(() => {
    const unlistenProgress = listen<LoadingProgress>("python-loading-progress", (event) => {
      console.log('Received loading progress:', event.payload);
      setLoadingProgress(prev => [...prev, event.payload]);
    });

    return () => {
      unlistenProgress.then(unlisten => unlisten());
    };
  }, []);

  const mutation = useMutation({
    mutationFn: async (
      params: { code: string },
    ): Promise<any> => {
      const maxRetries = 3;
      let retries = 0;
      while (retries < maxRetries) {
        try {
          console.log('Attempting to run Python code');
          const result = await invoke('python_runner_run', { code: params.code });
          console.log('Received result from Python runner:', result);
          if (typeof result === 'object' && result !== null && 'state' in result && 'payload' in result) {
            if (result.state === 'error' && result.payload === 'Pyodide is still loading. Please try again in a moment.') {
              console.log('Pyodide still loading, retrying...');
              retries++;
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
            } else {
              return result;
            }
          } else {
            return result;
          }
        } catch (error) {
          console.error('Error running Python code:', error);
          if (retries === maxRetries - 1) throw error;
          retries++;
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
        }
      }
      throw new Error('Max retries reached');
    },
    ...options,
  });

  return { ...mutation, loadingProgress };
};

type PythonCodeRendererProps = {
  code: string;
};

const PythonCodeRenderer = ({ code }: PythonCodeRendererProps) => {
  const { mutateAsync: run, data, isPending, error, loadingProgress } = usePythonRunnerRunMutation();
  const [output, setOutput] = useState<string | null>(null);
  const [executed, setExecuted] = useState(false);

  useEffect(() => {
    if (!isPending && !executed) {
      setExecuted(true);
      console.log('Running Python code:', code);
      run({code})
        .then((data) => {
          console.log('Python execution result:', data);
          setOutput(JSON.stringify(data.payload || null));
        })
        .catch((err) => {
          console.error('Error running Python code:', err);
          setOutput(err.message);
        });
    }
  }, [isPending, code, run, executed]);

  if (isPending || loadingProgress.length > 0) {
    return (
      <div>
        <div>Loading Python environment...</div>
        {loadingProgress.map((progress, index) => (
          <div key={index}>
            {progress.step}: {progress.progress === -1 ? 'Error' : `${progress.progress}%`}
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <div>{output}</div>;
};

export default PythonCodeRenderer;
