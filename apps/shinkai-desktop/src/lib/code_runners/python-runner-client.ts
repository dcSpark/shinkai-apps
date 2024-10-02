import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";

interface LoadingProgress {
  step: string;
  progress: number;
}

export const usePythonRunnerRunMutation = (
  options?: UseMutationOptions<
    any,
    Error,
    { code: string }
  >,
) => {
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress | null>(null);

  useEffect(() => {
    const unlistenProgress = listen<LoadingProgress>("python-loading-progress", (event) => {
      setLoadingProgress(event.payload);
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
          const result = await invoke('python_runner_run', { code: params.code });
          if (typeof result === 'object' && result !== null && 'state' in result && 'payload' in result) {
            if (result.state === 'error' && result.payload === 'Pyodide is still loading. Please try again in a moment.') {
              retries++;
              await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
            } else {
              return result;
            }
          } else {
            return result;
          }
        } catch (error) {
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
