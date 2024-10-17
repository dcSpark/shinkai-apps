import { UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { createLocalWallet } from '.';
import { CreateLocalWalletInput, CreateLocalWalletOutput } from './types';

type Options = UseMutationOptions<
  CreateLocalWalletOutput,
  APIError,
  CreateLocalWalletInput
>;

export const useCreateLocalWallet = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLocalWallet,
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
