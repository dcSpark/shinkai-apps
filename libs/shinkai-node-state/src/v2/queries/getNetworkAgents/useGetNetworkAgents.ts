import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetNetworkAgentsOutput } from './types';
import { getNetworkAgents } from './index';

export type UseGetNetworkAgents = [FunctionKeyV2.GET_NETWORK_AGENTS];

type Options = QueryObserverOptions<
  GetNetworkAgentsOutput,
  Error,
  GetNetworkAgentsOutput,
  GetNetworkAgentsOutput,
  UseGetNetworkAgents
>;

export const useGetNetworkAgents = (
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_NETWORK_AGENTS],
    queryFn: () => getNetworkAgents(),
    ...options,
  });
  return response;
};
