import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { CreateToolMetadataResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type CreateToolMetadataInput = Token & {
  nodeAddress: string;
  message: string;
  llmProviderId: string;
};

export type CreateToolMetadataOutput = CreateToolMetadataResponse;
