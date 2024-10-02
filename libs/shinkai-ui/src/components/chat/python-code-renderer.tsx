import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from 'react';
 
type PythonCodeRendererProps = {
  code: string;
};

export const usePythonRunnerRunMutation = (
  options?: UseMutationOptions<
    any,
    Error,
    { code: string }
  >,
) => {
  const response = useMutation({
    mutationFn: async (
      params: { code: string },
    ): Promise<any> => {
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

const PythonCodeRenderer = ({ code }: PythonCodeRendererProps) => {
  const { mutateAsync: run, data, isPending } = usePythonRunnerRunMutation();
  const [output, setOutput] = useState<string | null>(null);
  const [executed, setExecuted] = useState(false);
  useEffect(() => {
    if (!isPending && !executed) {
      setExecuted(true);
      console.log('Running Python code:', code);
      run({code})
        .then((data) => {
          console.log('Python stdout:', data);
          // console.log('Python stderr:', stderr);
          setOutput(JSON.stringify(data.payload || null));
        })
        .catch((err) => {
          console.error('Error running Python code:', err);
          setOutput(err.message);
        });
    }
  }, [isPending, code, data, run, executed]);

  if (isPending) {
    return <div>Loading Python environment...</div>;
  }

  return <div>{output}</div>;
};

export default PythonCodeRenderer;
