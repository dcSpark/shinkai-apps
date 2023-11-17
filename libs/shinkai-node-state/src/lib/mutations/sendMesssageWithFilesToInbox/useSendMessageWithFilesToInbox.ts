import { useMutation } from '@tanstack/react-query';

import { FunctionKey, queryClient } from '../../constants';
import { sendMessageWithFilesToInbox } from '.';

export const useSendMessageWithFilesToInbox = () => {
  return useMutation({
    mutationFn: sendMessageWithFilesToInbox,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_CHAT_CONVERSATION_PAGINATION],
      });
    },
  });
};
