import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type DeleteLLMProviderOutput = {
  status: string;
};

export type DeleteLLMProviderInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  agentId: string;
};
