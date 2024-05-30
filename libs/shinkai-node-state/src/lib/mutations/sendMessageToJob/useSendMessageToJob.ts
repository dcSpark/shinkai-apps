import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { sendMessageToJob } from '.';
import { FunctionKey } from '../../constants';
import { SendMessageToJobInput, SendMessageToJobOutput } from './types';

type Options = UseMutationOptions<
  SendMessageToJobOutput,
  Error,
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
          FunctionKey.GET_CHAT_CONVERSATION_PAGINATION,
          { inboxId: response.inbox },
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_INBOXES],
      });
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
