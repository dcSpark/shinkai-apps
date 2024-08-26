import { QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { searchTools } from './index';
import { GetSearchToolsInput, GetSearchToolsOutput } from './types';

export type UseGetSearchTools = [
  FunctionKeyV2.GET_SEARCH_TOOLS,
  GetSearchToolsInput,
];

type Options = QueryObserverOptions<
  GetSearchToolsOutput,
  Error,
  GetSearchToolsOutput,
  GetSearchToolsOutput,
  UseGetSearchTools
>;

export const useGetSearchTools = (
  input: GetSearchToolsInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_SEARCH_TOOLS, input],
    queryFn: () => searchTools(input),
    ...options,
  });
  return response;
};
