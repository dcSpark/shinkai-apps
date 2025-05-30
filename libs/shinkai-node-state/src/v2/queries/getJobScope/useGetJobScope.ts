import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetJobScopeInput, type GetJobScopeOutput } from './types';
import { getJobScope } from './index';

export type UseGetJobScope = [FunctionKeyV2.GET_JOB_SCOPE, GetJobScopeInput];

type Options = QueryObserverOptions<
  GetJobScopeOutput,
  Error,
  GetJobScopeOutput,
  GetJobScopeOutput,
  UseGetJobScope
>;
export const useGetJobScope = (
  input: GetJobScopeInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_JOB_SCOPE, input],
    queryFn: () => getJobScope(input),
    ...options,
  });
  return response;
};
