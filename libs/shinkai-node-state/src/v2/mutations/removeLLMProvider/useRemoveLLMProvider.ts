import { UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { removeLLMProvider } from '.';
import { RemoveLLMProviderInput, RemoveLLMProviderOutput } from './types';

type Options = UseMutationOptions<
  RemoveLLMProviderOutput,
  APIError,
  RemoveLLMProviderInput
>;

export const useRemoveLLMProvider = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeLLMProvider,
    ...options,
    onSuccess: (...onSuccessParameters) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_LLM_PROVIDERS],
      });
      if (options?.onSuccess) {
        options.onSuccess(...onSuccessParameters);
      }
    },
  });
};
