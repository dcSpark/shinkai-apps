import type { CredentialsPayload } from "@shinkai_network/shinkai-message-ts/models";

export type GetAgentsInput = CredentialsPayload & {
  sender: string;
  senderSubidentity: string;
  shinkaiIdentity: string;
};
