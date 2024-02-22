import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type CreateChatInput = CredentialsPayload & {
  nodeAddress: string;
  sender: string;
  senderSubidentity: string;
  receiver: string;
  receiverSubidentity: string;
  message: string;
};

export type CreateChatOutput = {
  inboxId: string;
};
