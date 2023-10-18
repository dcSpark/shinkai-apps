import { useInfiniteQuery } from "@tanstack/react-query";

import { FunctionKey } from "../../constants";
import { getChatConversation } from ".";
import { GetChatConversationInput } from "./types";

export const CONVERSATION_PAGINATION_LIMIT = 10;

export const useGetChatConversationWithPagination = (input: GetChatConversationInput) => {
  const response = useInfiniteQuery({
    queryKey: [FunctionKey.GET_CHAT_CONVERSATION_PAGINATION, input],
    queryFn: ({ pageParam }) =>
      getChatConversation({
        ...input,
        lastKey: pageParam?.lastKey ?? undefined,
        count: CONVERSATION_PAGINATION_LIMIT,
      }),
    getPreviousPageParam: (_, allPages) => {
      return allPages[0]?.length > CONVERSATION_PAGINATION_LIMIT - 2;
    },
    refetchInterval: () => input.refetchInterval || false,
  });
  return response;
};
