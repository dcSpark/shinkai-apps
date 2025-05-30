import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type GetToolPlaygroundMetadataResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetToolPlaygroundMetadataInput = Token & {
  nodeAddress: string;
  toolRouterKey: string;
};

export type GetToolPlaygroundMetadataOutput = GetToolPlaygroundMetadataResponse;
