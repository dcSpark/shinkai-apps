import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { APIError } from '../../types';
import { restoreLocalWallet } from '.';
import { RestoreLocalWalletInput, RestoreLocalWalletOutput } from './types';

type Options = UseMutationOptions<
  RestoreLocalWalletOutput,
  APIError,
  RestoreLocalWalletInput
>;

export const useRestoreLocalWallet = (options?: Options) => {
  return useMutation({
    mutationFn: restoreLocalWallet,
    ...options,
  });
};
