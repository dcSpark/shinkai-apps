import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type GetPlaygroundToolResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetPlaygroundToolInput = Token & {
  nodeAddress: string;
  toolRouterKey: string;
  xShinkaiOriginalToolRouterKey?: string;
};

export type GetPlaygroundToolOutput = GetPlaygroundToolResponse;
