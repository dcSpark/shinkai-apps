import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  type NetworkIdentifier,
  type RestoreCoinbaseMPCWalletResponse,
  type WalletRole,
} from '@shinkai_network/shinkai-message-ts/api/wallets';

export type RestoreCoinbaseMpcWalletInput = Token & {
  nodeAddress: string;
  network: NetworkIdentifier;
  name: string;
  privateKey: string;
  walletId: string;
  useServerSigner: string;
  role: WalletRole;
};
export type RestoreCoinbaseMpcWalletOutput = RestoreCoinbaseMPCWalletResponse;
