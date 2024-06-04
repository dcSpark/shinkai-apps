import { useQuery } from '@tanstack/react-query';

import { getHealth } from '.';
import { FunctionKey } from '../../constants';
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
