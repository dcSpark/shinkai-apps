import type {
  CredentialsPayload,
  SerializedLLMProvider,
} from '@shinkai_network/shinkai-message-ts/models';

export type UpdateLLMProviderOutput = {
  status: string;
};

export type UpdateLLMProviderInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  agent: SerializedLLMProvider;
};
