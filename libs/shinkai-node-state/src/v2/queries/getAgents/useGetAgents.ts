import { QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getAgents } from './index';
import { GetAgentsInput, GetAgentsOutput } from './types';

export type UseGetAgents = [FunctionKeyV2.GET_AGENTS, GetAgentsInput];

type Options = QueryObserverOptions<
  GetAgentsOutput,
  Error,
  GetAgentsOutput,
  GetAgentsOutput,
  UseGetAgents
>;

export const useGetAgents = (
  input: GetAgentsInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_AGENTS, input],
    queryFn: () => getAgents(input),
    ...options,
  });
  return response;
};
