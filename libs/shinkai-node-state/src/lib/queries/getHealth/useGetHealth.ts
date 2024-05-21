import { useQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getHealth } from '.';
import { GetHealthInput, Options } from './types';

export const useGetHealth = (
  input: GetHealthInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_HEALTH, input] as const,
    queryFn: async () => await getHealth(input),
    ...options,
  });
  return { ...response, nodeInfo: response.data };
};
