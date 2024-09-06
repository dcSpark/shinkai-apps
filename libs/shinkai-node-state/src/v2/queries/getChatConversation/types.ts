import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { InfiniteData } from '@tanstack/react-query';

export type GetChatConversationInput = Token & {
  nodeAddress: string;
  inboxId: string;
  count?: number;
  lastKey?: string;
  shinkaiIdentity: string;
  profile: string;
  enabled?: boolean;
  refetchIntervalEnabled?: boolean;
};
export type FormattedChatMessage = {
  hash: string;
  parentHash: string;
  inboxId: string;
  scheduledTime: string | undefined;
  content: string;
  workflowName: string | undefined;
  isLocal: boolean;
  sender: {
    avatar: string;
  };
  fileInbox?: {
    id: string;
    files: {
      name: string;
      preview?: string;
    }[];
  };
};
export type GetChatConversationOutput = FormattedChatMessage[];

export type ChatConversationInfiniteData =
  InfiniteData<GetChatConversationOutput> & {
    content: FormattedChatMessage[];
  };
