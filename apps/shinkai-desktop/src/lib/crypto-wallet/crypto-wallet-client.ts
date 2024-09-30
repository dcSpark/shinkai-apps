import { restoreCoinbaseMPCWallet } from '@shinkai_network/shinkai-message-ts/api/wallets';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

import { useAuth } from '../../store/auth';

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

export const useRestoreCoinbaseMPCWalletMutation = (
  options?: UseMutationOptions<any, Error, RestoreCoinbaseMPCWalletParams>
) => {
  const auth = useAuth((state) => state.auth);

  return useMutation({
    mutationFn: async (params: RestoreCoinbaseMPCWalletParams) => {
      if (!auth?.node_address || !auth?.api_v2_key) {
        throw new Error('Authentication information is missing');
      }

      return restoreCoinbaseMPCWallet(auth.node_address, auth.api_v2_key, params);
    },
    ...options,
  });
};

// Add other crypto wallet-related mutations or queries here in the future
