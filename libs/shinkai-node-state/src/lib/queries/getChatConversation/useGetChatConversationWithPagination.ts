import { isJobInbox } from '@shinkai_network/shinkai-message-ts/utils';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getChatConversation } from '.';
import { GetChatConversationInput, GetChatConversationOutput } from './types';

export const CONVERSATION_PAGINATION_LIMIT = 12;
export const CONVERSATION_PAGINATION_REFETCH = 5000;

export const useGetChatConversationWithPagination = (
  input: GetChatConversationInput,
) => {
  const response = useInfiniteQuery<
    GetChatConversationOutput,
    Error,
    InfiniteData<GetChatConversationOutput>,
    [string, GetChatConversationInput],
    { lastKey: string | null }
  >({
    queryKey: [FunctionKey.GET_CHAT_CONVERSATION_PAGINATION, input],
    queryFn: ({ pageParam }) =>
      getChatConversation({
        ...input,
        lastKey: pageParam?.lastKey ?? undefined,
        count: CONVERSATION_PAGINATION_LIMIT,
      }),
    getPreviousPageParam: (firstPage, pages) => {
      if (firstPage?.length < CONVERSATION_PAGINATION_LIMIT) return;
      const firstMessage = pages?.[0]?.[0];
      if (!firstMessage) return;
      return { lastKey: firstMessage.hash };
    },
    refetchInterval: ({ state }) => {
      if (!input?.refetchIntervalEnabled) return 0;
      const lastMessage = state.data?.pages?.at(-1)?.at(-1);
      if (!lastMessage) return 0;
      if (isJobInbox(input.inboxId) && lastMessage.isLocal)
        return CONVERSATION_PAGINATION_REFETCH;
      return 0;
    },
    initialPageParam: { lastKey: null },
    getNextPageParam: () => {
      return { lastKey: null };
    },
  });
  return response;
};
