import { QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getTools } from './index';
import { GetToolsListInput, GetToolsListOutput } from './types';

export type UseGetToolsList = [FunctionKeyV2.GET_LIST_TOOLS, GetToolsListInput];

type Options = QueryObserverOptions<
  GetToolsListOutput,
  Error,
  GetToolsListOutput,
  GetToolsListOutput,
  UseGetToolsList
>;

export const useGetTools = (
  input: GetToolsListInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_LIST_TOOLS, input],
    queryFn: () => getTools(input),
    select: (data) => data?.sort((a, b) => a.name.localeCompare(b.name)),
    ...options,
  });
  return response;
};
