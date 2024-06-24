import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { deleteLLMProvider } from './index';
import { DeleteLLMProviderInput, DeleteLLMProviderOutput } from './types';

type Options = UseMutationOptions<
  DeleteLLMProviderOutput,
  Error,
  DeleteLLMProviderInput
>;

export const useDeleteLLMProvider = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLLMProvider,
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
