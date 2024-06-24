import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type GetLLMProvidersInput = CredentialsPayload & {
  nodeAddress: string;
  sender: string;
  senderSubidentity: string;
  shinkaiIdentity: string;
};
