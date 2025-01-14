import { UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { updateLLMProvider } from '.';
import { UpdateLLMProviderInput, UpdateLLMProviderOutput } from './types';

type Options = UseMutationOptions<
  UpdateLLMProviderOutput,
  APIError,
  UpdateLLMProviderInput
>;

export const useUpdateLLMProvider = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateLLMProvider,
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
