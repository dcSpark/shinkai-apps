import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getProviderFromJob } from './index';
import { GetProviderFromJobInput } from './types';

export const useGetProviderFromJob = (input: GetProviderFromJobInput) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_PROVIDER_FROM_JOB, input],
    queryFn: () => getProviderFromJob(input),
  });
  return response;
};
