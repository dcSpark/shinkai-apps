import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetAgentsInput, type GetAgentsOutput } from './types';
import { getAgents } from './index';

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
