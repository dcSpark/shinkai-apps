import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { sendMessageToJob } from '.';
import { SendMessageToJobInput, SendMessageToJobOutput } from './types';

type Options = UseMutationOptions<
  SendMessageToJobOutput,
  APIError,
  SendMessageToJobInput
>;

export const useSendMessageToJob = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendMessageToJob,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [
          FunctionKeyV2.GET_CHAT_CONVERSATION_PAGINATION,
          { inboxId: response.inbox },
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_INBOXES],
      });
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
