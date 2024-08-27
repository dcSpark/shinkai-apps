import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { GetToolsResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetToolsListInput = Token & {
  nodeAddress: string;
};

export type GetToolsListOutput = GetToolsResponse;
