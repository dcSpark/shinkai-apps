import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type GetProviderFromJobResponse } from '@shinkai_network/shinkai-message-ts/api/jobs/types';

export type GetProviderFromJobInput = Token & {
  nodeAddress: string;
  jobId: string;
};

export type GetProviderFromJobOutput = GetProviderFromJobResponse;
