import { GetLLMProvidersResponse } from '@shinkai_network/shinkai-message-ts/api/jobs/types';

export type GetLLMProvidersInput = {
  nodeAddress: string;
};

export type GetLLMProvidersOutput = GetLLMProvidersResponse;
