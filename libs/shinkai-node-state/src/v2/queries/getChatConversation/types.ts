import { InfiniteData } from '@tanstack/react-query';

export type GetChatConversationInput = {
  nodeAddress: string;
  inboxId: string;
  count?: number;
  lastKey?: string;
  shinkaiIdentity: string;
  profile: string;
  enabled: boolean;
};

export type ChatConversationMessage = {
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
    }[];
  };
};

export type GetChatConversationOutput = ChatConversationMessage[];

export type ChatConversationInfiniteData =
  InfiniteData<GetChatConversationOutput> & {
    content: ChatConversationMessage[];
  };
