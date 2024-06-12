import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type GetChatConversationBranchesInput = JobCredentialsPayload & {
  nodeAddress: string;
  inboxId: string;
  count?: number;
  lastKey?: string;
  shinkaiIdentity: string;
  profile: string;
  refetchInterval?: number;
};

export type ChatConversationBranchesMessage = {
  hash: string;
  inboxId: string;
  scheduledTime: string | undefined;
  content: string;
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

export type GetChatConversationBranchesOutput =
  ChatConversationBranchesMessage[];
