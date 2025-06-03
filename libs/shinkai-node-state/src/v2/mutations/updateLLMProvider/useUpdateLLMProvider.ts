import {
  type UseMutationOptions,
  useQueryClient,
  useMutation,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type APIError } from '../../types';
import {
  type UpdateLLMProviderInput,
  type UpdateLLMProviderOutput,
} from './types';
import { updateLLMProvider } from '.';

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
    onSuccess: async (...onSuccessParameters) => {
      await queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_LLM_PROVIDERS],
      });
      if (options?.onSuccess) {
        options.onSuccess(...onSuccessParameters);
      }
    },
  });
};
