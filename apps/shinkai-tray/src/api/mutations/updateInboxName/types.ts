import type { CredentialsPayload } from "@shinkai_network/shinkai-message-ts/models";

export type UpdateInboxNameInput = CredentialsPayload & {
  senderSubidentity: string;
  sender: string;
  receiver: string;
  inboxName: string;
  inboxId: string;
};

export type UpdateInboxNameOutput = { success: string; data: null };
