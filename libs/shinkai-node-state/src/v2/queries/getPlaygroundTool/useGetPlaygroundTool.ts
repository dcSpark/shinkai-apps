import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetPlaygroundToolInput, type GetPlaygroundToolOutput } from './types';
import { getPlaygroundTool } from './index';

export type UseGetPlaygroundTool = [
  FunctionKeyV2.GET_PLAYGROUND_TOOL,
  GetPlaygroundToolInput,
];

type Options = QueryObserverOptions<
  GetPlaygroundToolOutput,
  Error,
  GetPlaygroundToolOutput,
  GetPlaygroundToolOutput,
  UseGetPlaygroundTool
>;

export const useGetPlaygroundTool = (
  input: GetPlaygroundToolInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_PLAYGROUND_TOOL, input],
    queryFn: () => getPlaygroundTool(input),
    ...options,
  });
  return response;
};
