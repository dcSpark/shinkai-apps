import type {
  AgentCredentialsPayload,
  SerializedLLMProvider,
} from '@shinkai_network/shinkai-message-ts/models';

export type AddLLMProviderInput = {
  nodeAddress: string;
  sender_subidentity: string;
  node_name: string;
  agent: SerializedLLMProvider;
  setupDetailsState: AgentCredentialsPayload;
};
