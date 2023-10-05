import { useQuery } from "@tanstack/react-query";

import { getLastUnreadMessages } from ".";
import { FunctionKey } from "../../constants";
import { GetLastUnreadMessagesInput } from "./types";

export const useGetLastUnreadMessages = (input: GetLastUnreadMessagesInput) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_UNREAD_CHAT_CONVERSATION, input],
    queryFn: () => getLastUnreadMessages(input),
    enabled: !!input.inboxId,
  });
  return response;
};
