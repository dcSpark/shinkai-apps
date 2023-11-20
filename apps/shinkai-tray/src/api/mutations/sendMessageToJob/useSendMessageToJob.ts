import { useMutation } from "@tanstack/react-query";

import { sendMessageToJob } from ".";
import { FunctionKey, queryClient } from "../../constants";

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
