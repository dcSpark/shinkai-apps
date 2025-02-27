import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getShinkaiFreeModelQuota } from '.';
import { GetShinkaiFreeModelQuotaInput, Options } from './types';

export const useGetShinkaiFreeModelQuota = (
  input: GetShinkaiFreeModelQuotaInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_SHINKAI_FREE_MODEL_QUOTA, input] as const,
    queryFn: async () => await getShinkaiFreeModelQuota(input),
    ...options,
  });
  return response;
};
