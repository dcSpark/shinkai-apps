import { createLocalWallet as createLocalWalletApi } from '@shinkai_network/shinkai-message-ts/api/wallets';

import { CreateLocalWalletInput } from './types';

export const createLocalWallet = async ({
  nodeAddress,
  token,
  network,
  role,
}: CreateLocalWalletInput) => {
  const data = await createLocalWalletApi(nodeAddress, token, {
    network: network,
    role: role,
  });
  return data;
};
