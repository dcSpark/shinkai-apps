import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  JobScope,
  UpdateChatConfigResponse,
} from '@shinkai_network/shinkai-message-ts/api/jobs/types';

export type UpdateChatConfigOutput = UpdateChatConfigResponse;

export type UpdateChatConfigInput = Token & {
  nodeAddress: string;
  jobId: string;
  jobScope: JobScope;
};
