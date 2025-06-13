import { getWalletBalance as getWalletBalanceApi } from '@shinkai_network/shinkai-message-ts/api/wallets';
import { type GetWalletBalanceInput } from './types';

export const getWalletBalance = async ({
  nodeAddress,
  token,
}: GetWalletBalanceInput) => {
  const response = await getWalletBalanceApi(nodeAddress, token);
  return response;
};
