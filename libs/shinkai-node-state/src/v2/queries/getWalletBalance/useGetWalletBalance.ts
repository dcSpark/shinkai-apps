import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import {
  type GetWalletBalanceInput,
  type GetWalletBalanceOutput,
} from './types';
import { getWalletBalance } from './index';

export type UseGetWalletList = [
  FunctionKeyV2.GET_WALLET_BALANCE,
  GetWalletBalanceInput,
];

type Options = QueryObserverOptions<
  GetWalletBalanceOutput,
  Error,
  GetWalletBalanceOutput,
  GetWalletBalanceOutput,
  UseGetWalletList
>;

export const useGetWalletBalance = (
  input: GetWalletBalanceInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_WALLET_BALANCE, input],
    queryFn: () => getWalletBalance(input),
    ...options,
  });
  return response;
};
