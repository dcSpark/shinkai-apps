import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type JobMessageResponse } from '@shinkai_network/shinkai-message-ts/api/jobs/types';

export type SendMessageToJobInput = Token & {
  nodeAddress: string;
  jobId: string;
  message: string;
  files?: File[];
  parent: string | null;
  toolKey?: string;
};

export type SendMessageToJobOutput = JobMessageResponse;
