import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type SendMessageToInboxInput = CredentialsPayload & {
  nodeAddress: string;
  sender: string;
  sender_subidentity: string;
  receiver: string;
  message: string;
  inboxId: string;
};

export type SendMessageWithFilesToInboxInput = CredentialsPayload & {
  nodeAddress: string;
  sender: string;
  receiver: string;
  senderSubidentity: string;
  message: string;
  inboxId: string;
  file: File;
};
