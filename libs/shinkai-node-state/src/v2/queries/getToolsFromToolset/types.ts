import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { GetToolsResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetToolsFromToolsetInput = Token & {
  nodeAddress: string;
  tool_set_key: string;
};

export type GetToolsFromToolsetOutput = GetToolsResponse;
