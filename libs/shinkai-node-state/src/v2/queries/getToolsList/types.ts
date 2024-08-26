import { GetToolsResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetToolsListInput = {
  nodeAddress: string;
};

export type GetToolsListOutput = GetToolsResponse;
