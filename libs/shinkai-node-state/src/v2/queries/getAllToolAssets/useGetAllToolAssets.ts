import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetAllToolAssetsInput, type GetAllToolAssetsOutput } from './types';
import { getAllToolAssets } from './index';

export type UseGetAllToolAssets = [
  FunctionKeyV2.GET_ALL_TOOL_ASSETS,
  GetAllToolAssetsInput,
];
type Options = QueryObserverOptions<
  GetAllToolAssetsOutput,
  Error,
  GetAllToolAssetsOutput,
  GetAllToolAssetsOutput,
  UseGetAllToolAssets
>;

export const useGetAllToolAssets = (
  input: GetAllToolAssetsInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_ALL_TOOL_ASSETS, input],
    queryFn: () => getAllToolAssets(input),
    ...options,
  });
  return response;
};
