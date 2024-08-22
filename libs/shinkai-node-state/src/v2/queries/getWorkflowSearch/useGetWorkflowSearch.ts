import { QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getWorkflowSearch } from './index';
import { GetWorkflowSearchInput, GetWorkflowSearchOutput } from './types';

export type UseGetWorkflowSearch = [
  FunctionKeyV2.GET_SEARCH_WORKFLOW,
  GetWorkflowSearchInput,
];

type Options = QueryObserverOptions<
  GetWorkflowSearchOutput,
  Error,
  GetWorkflowSearchOutput,
  GetWorkflowSearchOutput,
  UseGetWorkflowSearch
>;

export const useGetWorkflowSearch = (
  input: GetWorkflowSearchInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_SEARCH_WORKFLOW, input],
    queryFn: () => getWorkflowSearch(input),
    ...options,
  });
  return response;
};
