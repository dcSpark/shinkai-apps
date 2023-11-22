import { useMutation } from '@tanstack/react-query';

import { FunctionKey, queryClient } from '../../constants';
import { sendMessageToJob } from '.';

export const useSendMessageToJob = () => {
  return useMutation({
    mutationFn: sendMessageToJob,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_CHAT_CONVERSATION_PAGINATION],
      });
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_INBOXES],
      });
    },
  });
};
