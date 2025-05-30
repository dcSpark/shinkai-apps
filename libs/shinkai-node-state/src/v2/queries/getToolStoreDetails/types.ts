import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type GetToolStoreDetailsResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetToolStoreDetailsInput = Token & {
  nodeAddress: string;
  toolRouterKey: string;
};

export type GetToolStoreDetailsOutput = GetToolStoreDetailsResponse;
