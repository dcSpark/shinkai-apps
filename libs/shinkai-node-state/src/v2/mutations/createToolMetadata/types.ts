import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { CreateToolMetadataResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type CreateToolMetadataInput = Token & {
  nodeAddress: string;
  jobId: string;
  tools: string[];
  xShinkaiToolId?: string;
};

export type CreateToolMetadataOutput = CreateToolMetadataResponse;
