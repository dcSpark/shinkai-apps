import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  SerializedLLMProvider,
  UpdateLLMProviderResponse,
} from '@shinkai_network/shinkai-message-ts/api/jobs/types';

export type UpdateLLMProviderInput = Token & {
  nodeAddress: string;
  agent: SerializedLLMProvider;
};
export type UpdateLLMProviderOutput = UpdateLLMProviderResponse;
