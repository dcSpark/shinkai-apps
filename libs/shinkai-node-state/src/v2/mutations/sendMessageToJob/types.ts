import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { JobMessageResponse } from '@shinkai_network/shinkai-message-ts/api/jobs/types';

export type SendMessageToJobInput = Token & {
  nodeAddress: string;
  jobId: string;
  message: string;
  files?: File[];
  parent: string | null;
};

export type SendMessageToJobOutput = JobMessageResponse;
