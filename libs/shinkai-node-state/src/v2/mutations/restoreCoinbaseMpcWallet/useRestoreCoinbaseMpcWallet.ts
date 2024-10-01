import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

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
  return useMutation({
    mutationFn: restoreCoinbaseMPCWallet,
    ...options,
  });
};
