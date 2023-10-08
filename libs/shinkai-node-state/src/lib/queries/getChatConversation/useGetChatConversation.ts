import { useQuery } from "@tanstack/react-query";

import { FunctionKey } from "../../constants";
import { getChatConversation } from ".";
import { GetChatConversationInput } from "./types";

export const useGetChatConversation = (input: GetChatConversationInput) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_CHAT_CONVERSATION, input],
    queryFn: () => getChatConversation(input),
    enabled: !!input.inboxId,
  });
  return response;
};
