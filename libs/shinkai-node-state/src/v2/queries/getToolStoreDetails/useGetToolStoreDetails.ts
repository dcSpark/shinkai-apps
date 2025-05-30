import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetToolStoreDetailsInput, type GetToolStoreDetailsOutput } from './types';
import { getToolStoreDetails } from './index';

export type UseGetToolStoreDetails = [
  FunctionKeyV2.GET_TOOL_STORE_DETAILS,
  GetToolStoreDetailsInput,
];

type Options = QueryObserverOptions<
  GetToolStoreDetailsOutput,
  Error,
  GetToolStoreDetailsOutput,
  GetToolStoreDetailsOutput,
  UseGetToolStoreDetails
>;

export const useGetToolStoreDetails = (
  input: GetToolStoreDetailsInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_TOOL_STORE_DETAILS, input],
    queryFn: () => getToolStoreDetails(input),
    ...options,
  });
  return response;
};
