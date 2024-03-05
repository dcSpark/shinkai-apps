import { useMutation } from '@tanstack/react-query';

import { FunctionKey, queryClient } from '../../constants';
import { sendMessageToJob } from '.';

type CreateJobResponse = {
  data: {
    inbox: string;
    message_id: string;
    parent_message_id: string;
    scheduled_time: string;
  };
  message: string;
  status: string;
};

export const useSendMessageToJob = () => {
  return useMutation({
    mutationFn: sendMessageToJob,
    onSuccess: (response) => {
      const parsedResponse: CreateJobResponse = JSON.parse(response);
      queryClient.invalidateQueries({
        queryKey: [
          FunctionKey.GET_CHAT_CONVERSATION_PAGINATION,
          {
            inboxId: parsedResponse.data.inbox,
          },
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_INBOXES],
      });
    },
  });
};
