import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type GetWalletBalanceResponse } from '@shinkai_network/shinkai-message-ts/api/wallets';

export type GetWalletBalanceInput = Token & {
  nodeAddress: string;
};

export type GetWalletBalanceOutput = GetWalletBalanceResponse;
