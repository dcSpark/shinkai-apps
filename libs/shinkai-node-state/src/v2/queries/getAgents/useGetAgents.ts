import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getAgents } from './index';
import { GetAgentsInput } from './types';

export const useGetAgents = (input: GetAgentsInput) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_AGENTS, input],
    queryFn: () => getAgents(input),
  });
  return response;
};
