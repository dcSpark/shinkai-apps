import { useQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getHealth } from '.';
import { GetHealthInput, Options } from './types';

export const useGetHealth = (input: GetHealthInput, options?: Options) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_HEALTH, input],
    queryFn: async () => await getHealth(input),
    ...options,
  });
  return { ...response, nodeInfo: response.data };
};
