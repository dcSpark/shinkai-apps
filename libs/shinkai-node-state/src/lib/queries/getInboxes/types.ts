import type { CredentialsPayload } from "@shinkai_network/shinkai-message-ts/models";

export type GetInboxesInput = CredentialsPayload & {
  sender: string;
  receiver: string;
  senderSubidentity: string;
  targetShinkaiNameProfile: string;
};
