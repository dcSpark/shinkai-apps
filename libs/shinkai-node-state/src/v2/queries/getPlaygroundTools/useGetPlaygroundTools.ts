import { QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getPlaygroundTools } from './index';
import { GetPlaygroundToolsInput, GetPlaygroundToolsOutput } from './types';

export type UseGetPlaygroundTools = [
  FunctionKeyV2.GET_PLAYGROUND_TOOLS,
  GetPlaygroundToolsInput,
];

type Options = QueryObserverOptions<
  GetPlaygroundToolsOutput,
  Error,
  GetPlaygroundToolsOutput,
  GetPlaygroundToolsOutput,
  UseGetPlaygroundTools
>;

export const useGetPlaygroundTools = (
  input: GetPlaygroundToolsInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_PLAYGROUND_TOOLS, input],
    queryFn: () => getPlaygroundTools(input),
    ...options,
  });
  return response;
};
