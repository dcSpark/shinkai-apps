import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetChatConversationInput } from './types';
import { getChatConversation } from '.';

export const useGetChatConversation = (input: GetChatConversationInput) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_CHAT_CONVERSATION, input],
    queryFn: () => getChatConversation(input),
    enabled: !!input.inboxId,
  });
  return response;
};
