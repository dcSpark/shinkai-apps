import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { StopGeneratingLLMOutput } from '@shinkai_network/shinkai-message-ts/api/jobs/types';

export type StopGeneratingLLMOutput = StopGeneratingLLMOutput;

export type StopGeneratingLLMInput = Token & {
  nodeAddress: string;
  jobId: string;
};
