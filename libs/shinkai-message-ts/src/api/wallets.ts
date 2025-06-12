import { httpClient } from '../http-client';
import { urlJoin } from '../utils/url-join';

export enum WalletRole {
  Payment = 'Payment',
  Receiving = 'Receiving',
  Both = 'Both',
}
export enum NetworkIdentifier {
  BaseSepolia = 'base-sepolia',
  BaseMainnet = 'base-mainnet',
  EthereumSepolia = 'ethereum-sepolia',
  EthereumMainnet = 'ethereum-mainnet',
  ArbitrumSepolia = 'arbitrum-sepolia',
  ArbitrumMainnet = 'arbitrum-mainnet',
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
interface NativeAsset {
  network_id: string;
  asset_id: string;
  decimals: number;
  contract_address: string | null;
}

interface Network {
  id: string;
  display_name: string;
  chain_id: number;
  protocol_family: string;
  is_testnet: boolean;
  native_asset: NativeAsset;
}

interface Address {
  wallet_id: string;
  network_id: string;
  public_key: string | null;
  address_id: string;
}

interface WalletData {
  id: string;
  network: NetworkIdentifier;
  address: Address;
  private_key: string;
  public_key: string;
}

interface LocalEthersWallet {
  type: string;
  data: WalletData;
}

export type GetWalletListResponse = {
  payment_wallet: LocalEthersWallet;
  receiving_wallet: LocalEthersWallet;
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

export const getWalletList = async (
  nodeAddress: string,
  bearerToken: string,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/list_wallets'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as GetWalletListResponse;
};

export type GetWalletBalanceRequest = {
  network: NetworkIdentifier;
};
export type GetWalletBalanceResponse = {
  [key: string]: {
    amount: string;
    asset: {
      asset_id: string;
      contract_address: string | null;
      decimals: number;
      network_id: string;
    };
    decimals: number;
  };
};

export const getWalletBalance = async (
  nodeAddress: string,
  bearerToken: string,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/get_wallet_balance'),

    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as GetWalletBalanceResponse;
};
