import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type UpdateLLMProviderInJobResponse } from '@shinkai_network/shinkai-message-ts/api/jobs/types';

export type UpdateAgentInJobInput = Token & {
  nodeAddress: string;
  jobId: string;
  newAgentId: string;
};

export type UpdateAgentInJobOutput = UpdateLLMProviderInJobResponse;
