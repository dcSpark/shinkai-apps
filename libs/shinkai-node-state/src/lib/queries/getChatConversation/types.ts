import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type GetChatConversationInput = JobCredentialsPayload & {
  nodeAddress: string;
  inboxId: string;
  count?: number;
  lastKey?: string;
  shinkaiIdentity: string;
  profile: string;
  refetchIntervalEnabled?: boolean;
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
