import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { GetLLMProvidersResponse } from '@shinkai_network/shinkai-message-ts/api/jobs/types';

export type GetJobScopeInput = Token & {
  nodeAddress: string;
  jobId: string;
};

export type GetJobScopeOutput = GetLLMProvidersResponse;
