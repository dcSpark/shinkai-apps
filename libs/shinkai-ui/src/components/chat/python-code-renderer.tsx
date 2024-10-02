import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { Play } from "lucide-react";
import { useEffect, useState } from 'react';

import { Button } from '../button';
 
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

  return (
    <div>
      <Button
        disabled={isPending}
        isLoading={isPending}
        onClick={() => {
          run({ code });
        }}
      >
        <Play />
      </Button>
      {(!isPending && data) && <div className="mt-4">{JSON.stringify(data)}</div>}
    </div>
  );
};

export default PythonCodeRenderer;
