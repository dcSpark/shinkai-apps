import { QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { GetSheetInput } from '../../../lib/queries/getSheet/types';
import { FunctionKeyV2 } from '../../constants';
import { getJobScope } from './index';
import { GetJobScopeInput, GetJobScopeOutput } from './types';

export type UseGetJobScope = [FunctionKeyV2.GET_JOB_SCOPE, GetSheetInput];

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
  });
  return response;
};
