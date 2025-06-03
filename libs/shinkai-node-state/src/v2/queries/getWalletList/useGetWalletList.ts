import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetWalletListInput, type GetWalletListOutput } from './types';
import { getWalletList } from './index';

export type UseGetWalletList = [
  FunctionKeyV2.GET_WALLET_LIST,
  GetWalletListInput,
];

type Options = QueryObserverOptions<
  GetWalletListOutput,
  Error,
  GetWalletListOutput,
  GetWalletListOutput,
  UseGetWalletList
>;

export const useGetWalletList = (
  input: GetWalletListInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_WALLET_LIST, input],
    queryFn: () => getWalletList(input),
    ...options,
  });
  return response;
};
