import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../../lib/constants';
import { sendMessageWithFilesToJob } from '.';
import {
  SendMessageWithFilesToInboxInput,
  SendMessageWithFilesToInboxOutput,
} from './types';

type Options = UseMutationOptions<
  SendMessageWithFilesToInboxOutput,
  Error,
  SendMessageWithFilesToInboxInput
>;

export const useSendMessageWithFilesToInbox = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendMessageWithFilesToJob,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_CHAT_CONVERSATION_PAGINATION],
      });
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
