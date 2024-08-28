import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { GetToolsResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetSearchToolsInput = Token & {
  nodeAddress: string;
  search: string;
};

export type GetSearchToolsOutput = GetToolsResponse;
