import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { UpdateLLMProviderResponse } from '@shinkai_network/shinkai-message-ts/api/jobs/types';

export type RemoveLLMProviderInput = Token & {
  nodeAddress: string;
  llmProviderId: string;
};
export type RemoveLLMProviderOutput = UpdateLLMProviderResponse;
