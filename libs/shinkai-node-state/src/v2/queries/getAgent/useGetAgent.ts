import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetAgentInput } from './types';
import { getAgent } from './index';

export const useGetAgent = (input: GetAgentInput) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_AGENT, input],
    queryFn: () => getAgent(input),
  });
  return response;
};
