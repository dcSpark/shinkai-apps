import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { GetWalletListResponse } from '@shinkai_network/shinkai-message-ts/api/wallets';

export type GetWalletListInput = Token & {
  nodeAddress: string;
};

export type GetWalletListOutput = GetWalletListResponse;
