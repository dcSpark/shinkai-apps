import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

// Mutations
export const usePythonRunnerRunMutation = (
  options?: UseMutationOptions<
    any,
    Error,
    { model: string }
  >,
) => {
  const response = useMutation({
    mutationFn: async (
      code,
    ): Promise<any> => {
        return invoke('python_runner_run');
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
