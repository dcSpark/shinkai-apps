import { GetAgentResponse } from '@shinkai_network/shinkai-message-ts/api/agents/types';
import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';

export type GetJobFolderNameInput = Token & {
  nodeAddress: string;
  jobId: string;
};

export type GetJobFolderNameOutput = GetAgentResponse;
