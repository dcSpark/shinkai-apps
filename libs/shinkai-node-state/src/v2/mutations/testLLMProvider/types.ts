import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  AddLLMProviderResponse,
  SerializedLLMProvider,
} from '@shinkai_network/shinkai-message-ts/api/jobs/types';

export type TestLLMProviderInput = Token & {
  nodeAddress: string;
  agent: SerializedLLMProvider;
};
export type TestLLMProviderOutput = AddLLMProviderResponse;
