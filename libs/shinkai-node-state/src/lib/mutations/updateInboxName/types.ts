import { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type UpdateInboxNameInput = CredentialsPayload & {
  nodeAddress: string;
  senderSubidentity: string;
  sender: string;
  receiver: string;
  inboxName: string;
  inboxId: string;
};

export type UpdateInboxNameOutput = { success: string; data: null };
