import {
  type UseMutationOptions,
  useQueryClient,
  useMutation,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type APIError } from '../../types';
import {
  type RemoveLLMProviderInput,
  type RemoveLLMProviderOutput,
} from './types';
import { removeLLMProvider } from '.';

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
