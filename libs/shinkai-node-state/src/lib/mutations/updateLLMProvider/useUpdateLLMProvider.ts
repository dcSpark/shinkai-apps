import { UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { updateLLMProvider } from '.';
import { UpdateLLMProviderInput, UpdateLLMProviderOutput } from './types';

type Options = UseMutationOptions<
  UpdateLLMProviderOutput,
  Error,
  UpdateLLMProviderInput
>;

export const useUpdateLLMProvider = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateLLMProvider,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_AGENTS],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
