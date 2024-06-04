import { useMutation, useQueryClient } from '@tanstack/react-query';

import { sendMessageToInbox } from '.';
import { FunctionKey } from '../../constants';

export const useSendMessageToInbox = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendMessageToInbox,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_CHAT_CONVERSATION_PAGINATION],
      });
    },
  });
};
