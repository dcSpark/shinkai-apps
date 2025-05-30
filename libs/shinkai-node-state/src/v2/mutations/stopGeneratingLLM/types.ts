import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type StopGeneratingLLMResponse } from '@shinkai_network/shinkai-message-ts/api/jobs/types';

export type StopGeneratingLLMOutput = StopGeneratingLLMResponse;

export type StopGeneratingLLMInput = Token & {
  nodeAddress: string;
  jobId: string;
};
