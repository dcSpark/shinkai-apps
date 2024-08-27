import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { GetLLMProvidersResponse } from '@shinkai_network/shinkai-message-ts/api/jobs/types';

export type GetLLMProvidersInput = Token & {
  nodeAddress: string;
};

export type GetLLMProvidersOutput = GetLLMProvidersResponse;
