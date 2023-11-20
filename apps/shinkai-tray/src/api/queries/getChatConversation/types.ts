import type {
  JobCredentialsPayload,
  ShinkaiMessage,
} from "@shinkai_network/shinkai-message-ts/models";

export type GetChatConversationInput = JobCredentialsPayload & {
  inboxId: string;
  count?: number;
  lastKey?: string;
  shinkaiIdentity: string;
  profile: string;
};

export type GetChatConversationOutput = ShinkaiMessage[];
