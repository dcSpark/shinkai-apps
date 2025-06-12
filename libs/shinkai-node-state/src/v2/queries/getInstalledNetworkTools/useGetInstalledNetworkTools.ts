import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import {
  type GetInstalledNetworkToolsInput,
  type GetInstalledNetworkToolsOutput,
} from './types';
import { getInstalledNetworkTools } from './index';

export type UseGetInstalledNetworkTools = [
  FunctionKeyV2.GET_INSTALLED_NETWORK_TOOLS,
  GetInstalledNetworkToolsInput,
];

type Options = QueryObserverOptions<
  GetInstalledNetworkToolsOutput,
  Error,
  GetInstalledNetworkToolsOutput,
  GetInstalledNetworkToolsOutput,
  UseGetInstalledNetworkTools
>;

export const useGetInstalledNetworkTools = (
  input: GetInstalledNetworkToolsInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_INSTALLED_NETWORK_TOOLS, input],
    queryFn: () => getInstalledNetworkTools(input),
    ...options,
  });
  return response;
};
