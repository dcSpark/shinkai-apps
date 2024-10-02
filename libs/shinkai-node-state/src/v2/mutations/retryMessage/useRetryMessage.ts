import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { retryMessage } from './index';
import { RetryMessageInput, RetryMessageOutput } from './types';

type Options = UseMutationOptions<
  RetryMessageOutput,
  APIError,
  RetryMessageInput
>;

export const useRetryMessage = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: retryMessage,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [
          FunctionKeyV2.GET_CHAT_CONVERSATION_PAGINATION,
          { inboxId: variables.inboxId },
        ],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
