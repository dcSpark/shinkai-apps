import {
  AddLLMProviderResponse,
  SerializedLLMProvider,
} from '@shinkai_network/shinkai-message-ts/api/jobs/types';

export type AddLLMProviderInput = {
  nodeAddress: string;
  agent: SerializedLLMProvider;
};
export type AddLLMProviderOutput = AddLLMProviderResponse;
