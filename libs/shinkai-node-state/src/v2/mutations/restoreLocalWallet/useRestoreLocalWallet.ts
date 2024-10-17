import { UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { restoreLocalWallet } from '.';
import { RestoreLocalWalletInput, RestoreLocalWalletOutput } from './types';

type Options = UseMutationOptions<
  RestoreLocalWalletOutput,
  APIError,
  RestoreLocalWalletInput
>;

export const useRestoreLocalWallet = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreLocalWallet,
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
