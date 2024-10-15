import { httpClient } from '../http-client';
import { urlJoin } from '../utils/url-join';

export enum WalletRole {
  Payment = 'Payment',
  Receiving = 'Receiving',
  Both = 'Both',
}
export enum NetworkIdentifier {
  BaseSepolia = 'BaseSepolia',
  BaseMainnet = 'BaseMainnet',
  EthereumSepolia = 'EthereumSepolia',
  EthereumMainnet = 'EthereumMainnet',
  ArbitrumSepolia = 'ArbitrumSepolia',
  ArbitrumMainnet = 'ArbitrumMainnet',
  Anvil = 'Anvil',
}
export type WalletSource =
  | {
      Mnemonic: string;
    }
  | {
      PrivateKey: string;
    };

export type RestoreCoinbaseMPCWalletRequest = {
  network: NetworkIdentifier;
  config: {
    name: string;
    private_key: string;
    wallet_id?: string;
    use_server_signer: string;
  };
  wallet_id: string;
  role: WalletRole;
};

export type RestoreLocalWalletRequest = {
  network: NetworkIdentifier;
  source: WalletSource;
  role: WalletRole;
};

export type CreateLocalWalletRequest = {
  network: NetworkIdentifier;
  role: WalletRole;
};

export type RestoreCoinbaseMPCWalletResponse = {
  status: string;
};

export const restoreCoinbaseMPCWallet = async (
  nodeAddress: string,
  bearerToken: string,
  payload: RestoreCoinbaseMPCWalletRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/restore_coinbase_mpc_wallet'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};

export const restoreLocalWallet = async (
  nodeAddress: string,
  bearerToken: string,
  payload: RestoreLocalWalletRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/restore_local_wallet'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};

export const createLocalWallet = async (
  nodeAddress: string,
  bearerToken: string,
  payload: CreateLocalWalletRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/create_local_wallet'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};

export const listWallets = async (nodeAddress: string, bearerToken: string) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/list_wallets'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};
