import type { CredentialsPayload } from "@shinkai_network/shinkai-message-ts/models";

export type SendMessageToInboxInput = CredentialsPayload & {
  sender: string;
  sender_subidentity: string;
  receiver: string;
  message: string;
  inboxId: string;
};

export type SendMessageWithFilesToInboxInput = CredentialsPayload & {
  sender: string;
  receiver: string;
  senderSubidentity: string;
  message: string;
  inboxId: string;
  file: File;
};
