import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetProviderFromJobInput } from './types';
import { getProviderFromJob } from './index';

export const useGetProviderFromJob = (input: GetProviderFromJobInput) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_PROVIDER_FROM_JOB, input],
    queryFn: () => getProviderFromJob(input),
    enabled: !!input.jobId,
  });
  return response;
};
