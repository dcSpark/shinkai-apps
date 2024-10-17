import { UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { restoreCoinbaseMPCWallet } from '.';
import {
  RestoreCoinbaseMpcWalletInput,
  RestoreCoinbaseMpcWalletOutput,
} from './types';

type Options = UseMutationOptions<
  RestoreCoinbaseMpcWalletOutput,
  APIError,
  RestoreCoinbaseMpcWalletInput
>;

export const useRestoreCoinbaseMpcWallet = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreCoinbaseMPCWallet,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [
          FunctionKeyV2.GET_WALLET_LIST,
          {
            token: variables.token,
            nodeAddress: variables.nodeAddress,
          },
        ],
      });
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
