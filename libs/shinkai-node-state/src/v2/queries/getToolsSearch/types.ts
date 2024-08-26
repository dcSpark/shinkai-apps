import { GetToolsResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetSearchToolsInput = {
  nodeAddress: string;
  search: string;
};

export type GetSearchToolsOutput = GetToolsResponse;
