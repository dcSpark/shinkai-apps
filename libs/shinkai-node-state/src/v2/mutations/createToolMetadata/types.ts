import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type CreateToolMetadataResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type CreateToolMetadataInput = Token & {
  nodeAddress: string;
  jobId: string;
  tools: string[];
  xShinkaiToolId?: string;
};

export type CreateToolMetadataOutput = CreateToolMetadataResponse;
