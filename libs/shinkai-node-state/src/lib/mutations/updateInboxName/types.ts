import { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type UpdateInboxNamebInput = CredentialsPayload & {
  senderSubidentity: string;
  sender: string;
  receiver: string;
  receiverSubidentity: string;
  inboxName: string;
  inboxId: string;
};

export type UpdateInboxNameOutput = { success: string; data: null };
