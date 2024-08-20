import { JobMessageResponse } from '@shinkai_network/shinkai-message-ts/models/v2/types';

export type SendMessageToJobInput = {
  nodeAddress: string;
  jobId: string;
  message: string;
  // files_inbox: string;
  parent: string | null;
  workflowCode?: string;
  workflowName?: string;
};

export type SendMessageToJobOutput = JobMessageResponse;
