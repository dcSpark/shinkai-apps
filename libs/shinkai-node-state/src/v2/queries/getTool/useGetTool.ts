import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetToolInput, type GetToolOutput } from './types';
import { getTool } from './index';

export type UseGetTool = [FunctionKeyV2.GET_TOOL, GetToolInput];

type Options = QueryObserverOptions<
  GetToolOutput,
  Error,
  GetToolOutput,
  GetToolOutput,
  UseGetTool
>;

export const useGetTool = (
  input: GetToolInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_TOOL, input],
    queryFn: () => getTool(input),
    ...options,
  });
  return response;
};
