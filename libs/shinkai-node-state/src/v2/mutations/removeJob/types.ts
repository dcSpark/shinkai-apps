import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';

export type RemoveJobOutput = {
  status: string;
};

export type RemoveJobInput = Token & {
  nodeAddress: string;
  jobId: string;
};
