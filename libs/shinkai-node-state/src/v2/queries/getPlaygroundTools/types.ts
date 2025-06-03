import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type GetPlaygroundToolsResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetPlaygroundToolsInput = Token & {
  nodeAddress: string;
};

export type GetPlaygroundToolsOutput = GetPlaygroundToolsResponse;
