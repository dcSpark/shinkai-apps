import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { createToolCode } from '.';
import { CreateToolCodeInput, CreateToolCodeOutput } from './types';

type Options = UseMutationOptions<
  CreateToolCodeOutput,
  APIError,
  CreateToolCodeInput
>;

export const useCreateToolCode = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createToolCode,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [
          FunctionKeyV2.GET_CHAT_CONVERSATION_PAGINATION,
          { inboxId: response.inbox },
        ],
      });
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
