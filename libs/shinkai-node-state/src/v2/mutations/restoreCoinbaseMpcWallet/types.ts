import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { RestoreCoinbaseMPCWalletResponse } from '@shinkai_network/shinkai-message-ts/api/wallets';

export type RestoreCoinbaseMpcWalletInput = Token & {
  nodeAddress: string;
  network: string;
  name: string;
  privateKey: string;
  walletId?: string;
  useServerSigner: string;
  role: string;
};
export type RestoreCoinbaseMpcWalletOutput = RestoreCoinbaseMPCWalletResponse;
