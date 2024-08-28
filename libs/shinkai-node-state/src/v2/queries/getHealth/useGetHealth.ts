import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getHealth } from '.';
import { GetHealthInput, Options } from './types';

export const useGetHealth = (
  input: GetHealthInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_HEALTH, input] as const,
    queryFn: async () => await getHealth(input),
    ...options,
  });
  return { ...response, nodeInfo: response.data };
};
