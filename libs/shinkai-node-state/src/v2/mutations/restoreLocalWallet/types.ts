import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  NetworkIdentifier,
  RestoreCoinbaseMPCWalletResponse,
  WalletRole,
} from '@shinkai_network/shinkai-message-ts/api/wallets';

export type RestoreLocalWalletInput = Token & {
  nodeAddress: string;
  network: NetworkIdentifier;
  name: string;
  privateKey: string;
  mnemonic: string;
  role: WalletRole;
} & (
    | {
        privateKey: string;
      }
    | {
        mnemonic: string;
      }
  );
export type RestoreLocalWalletOutput = RestoreCoinbaseMPCWalletResponse;
