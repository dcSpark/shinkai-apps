import { httpClient } from '../http-client';
import { urlJoin } from '../utils/url-join';

interface RestoreCoinbaseMPCWalletParams {
  network: string;
  config: {
    name: string;
    private_key: string;
    wallet_id?: string;
    use_server_signer: string;
  };
  wallet_id?: string;
  role: string;
}

export const restoreCoinbaseMPCWallet = async (
  nodeAddress: string,
  bearerToken: string,
  payload: RestoreCoinbaseMPCWalletParams
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/restore_coinbase_mpc_wallet'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    }
  );
  return response.data;
};

// Add other wallet-related API calls here in the future
