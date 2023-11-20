import { useMutation } from "@tanstack/react-query";

import { sendMessageWithFilesToInbox } from ".";
import { FunctionKey, queryClient } from "../../constants";

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
