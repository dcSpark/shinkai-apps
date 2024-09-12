import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { StopGeneratingLLMResponse } from '@shinkai_network/shinkai-message-ts/api/jobs/types';

export type StopGeneratingLLMOutput = StopGeneratingLLMResponse;

export type StopGeneratingLLMInput = Token & {
  nodeAddress: string;
  jobId: string;
};
