import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type JobMessageResponse } from '@shinkai_network/shinkai-message-ts/api/jobs/types';

export type RetryMessageInput = Token & {
  nodeAddress: string;
  inboxId: string;
  messageId: string;
};

export type RetryMessageOutput = JobMessageResponse;
