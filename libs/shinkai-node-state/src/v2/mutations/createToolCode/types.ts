import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { CreateToolCodeResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type CreateToolCodeInput = Token & {
  nodeAddress: string;
  message: string;
  llmProviderId: string;
  jobId?: string;
  tools: string[];
};

export type CreateToolCodeOutput = CreateToolCodeResponse;
