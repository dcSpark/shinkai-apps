import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { GetChatConfigResponse } from '@shinkai_network/shinkai-message-ts/api/jobs/types';

export type GetChatConfigInput = Token & {
  nodeAddress: string;
  jobId: string;
};

export type GetChatConfigOutput = GetChatConfigResponse;
