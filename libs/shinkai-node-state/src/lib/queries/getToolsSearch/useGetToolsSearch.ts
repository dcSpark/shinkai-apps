import { QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getToolsSearch } from './index';
import { GetWorkflowSearchInput, GetWorkflowSearchOutput } from './types';

export type UseGetToolsSearch = [
  FunctionKey.GET_SEARCH_TOOLS,
  GetWorkflowSearchInput,
];

type Options = QueryObserverOptions<
  GetWorkflowSearchOutput,
  Error,
  GetWorkflowSearchOutput,
  GetWorkflowSearchOutput,
  UseGetToolsSearch
>;

export const useGetToolsSearch = (
  input: GetWorkflowSearchInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_SEARCH_TOOLS, input],
    queryFn: () => getToolsSearch(input),
    ...options,
  });
  return response;
};
