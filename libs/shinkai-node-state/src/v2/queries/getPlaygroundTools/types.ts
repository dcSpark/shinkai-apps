import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { GetPlaygroundToolsResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetPlaygroundToolsInput = Token & {
  nodeAddress: string;
};

export type GetPlaygroundToolsOutput = GetPlaygroundToolsResponse;
