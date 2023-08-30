import { useMutation, useQueryClient } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { sendMessageWithFilesToInbox } from '.';

export const useSendMessageWithFilesToInbox = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendMessageWithFilesToInbox,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_CHAT_CONVERSATION_PAGINATION],
      });
    },
  });
};
