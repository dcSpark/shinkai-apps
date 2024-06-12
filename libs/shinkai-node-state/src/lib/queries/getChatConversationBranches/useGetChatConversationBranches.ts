import { useQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getChatConversationBranches } from '.';
import { GetChatConversationBranchesInput } from './types';

export const useGetChatConversationBranches = (
  input: GetChatConversationBranchesInput,
) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_CHAT_CONVERSATION_BRANCHES, input],
    queryFn: () => getChatConversationBranches(input),
    enabled: !!input.inboxId,
  });
  return response;
};
