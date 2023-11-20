import { useMutation } from '@tanstack/react-query';

import { FunctionKey, queryClient } from '../../constants';
import { sendMessageToInbox } from '.';

export const useSendMessageToInbox = () => {
  return useMutation({
    mutationFn: sendMessageToInbox,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_CHAT_CONVERSATION_PAGINATION],
      });
    },
  });
};
