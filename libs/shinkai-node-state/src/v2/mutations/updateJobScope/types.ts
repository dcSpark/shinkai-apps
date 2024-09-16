import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { UpdateChatConfigResponse } from '@shinkai_network/shinkai-message-ts/api/jobs/types';
import { JobScope } from '@shinkai_network/shinkai-message-ts/models/SchemaTypes';

export type UpdateChatConfigOutput = UpdateChatConfigResponse;

export type UpdateChatConfigInput = Token & {
  nodeAddress: string;
  jobId: string;
  jobScope: JobScope;
};
