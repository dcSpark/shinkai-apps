import { QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getWorkflowSearch } from './index';
import { GetWorkflowSearchInput, GetWorkflowSearchOutput } from './types';

export type UseGetWorkflowSearch = [
  FunctionKey.GET_SEARCH_WORKFLOW,
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
    queryKey: [FunctionKey.GET_SEARCH_WORKFLOW, input],
    queryFn: () => getWorkflowSearch(input),
    ...options,
  });
  return response;
};
