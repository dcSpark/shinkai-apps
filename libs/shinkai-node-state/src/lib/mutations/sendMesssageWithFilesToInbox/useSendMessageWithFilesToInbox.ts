import { useMutation, useQueryClient } from '@tanstack/react-query';

import { sendMessageWithFilesToInbox } from '.';
import { FunctionKey } from '../../constants';

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
