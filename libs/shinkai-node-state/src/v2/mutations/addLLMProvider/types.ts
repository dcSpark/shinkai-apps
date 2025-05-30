import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  type AddLLMProviderResponse,
  type SerializedLLMProvider,
} from '@shinkai_network/shinkai-message-ts/api/jobs/types';

export type AddLLMProviderInput = Token & {
  nodeAddress: string;
  agent: SerializedLLMProvider;
  enableTest?: boolean;
};
export type AddLLMProviderOutput = AddLLMProviderResponse;
