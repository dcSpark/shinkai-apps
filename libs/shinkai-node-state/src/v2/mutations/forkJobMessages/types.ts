import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type ForkJobMessagesResponse } from '@shinkai_network/shinkai-message-ts/api/jobs/types';

export type ForkJobMessagesInput = Token & {
  nodeAddress: string;
  jobId: string;
  messageId: string;
};

export type ForkJobMessagesOutput = ForkJobMessagesResponse;
