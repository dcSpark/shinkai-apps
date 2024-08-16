import { QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getToolsList } from './index';
import { GetToolsListInput, GetToolsListOutput } from './types';

export type UseGetToolsList = [FunctionKey.GET_LIST_TOOLS, GetToolsListInput];

type Options = QueryObserverOptions<
  GetToolsListOutput,
  Error,
  GetToolsListOutput,
  GetToolsListOutput,
  UseGetToolsList
>;

export const useGetToolsList = (
  input: GetToolsListInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_LIST_TOOLS, input],
    queryFn: () => getToolsList(input),
    ...options,
  });
  return response;
};
