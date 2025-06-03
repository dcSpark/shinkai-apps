import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetToolsFromToolsetInput, type GetToolsFromToolsetOutput } from './types';
import { getToolsFromToolset } from './index';

export type UseGetToolsFromToolset = [
  FunctionKeyV2.GET_TOOLS_FROM_TOOLSET,
  GetToolsFromToolsetInput,
];

type Options = QueryObserverOptions<
  GetToolsFromToolsetOutput,
  Error,
  GetToolsFromToolsetOutput,
  GetToolsFromToolsetOutput,
  UseGetToolsFromToolset
>;

export const useGetToolsFromToolset = (
  input: GetToolsFromToolsetInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_TOOLS_FROM_TOOLSET, input],
    queryFn: () => getToolsFromToolset(input),
    ...options,
  });
  return response;
};
