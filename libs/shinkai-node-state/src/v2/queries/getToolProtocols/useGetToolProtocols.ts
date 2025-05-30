import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetToolProtocolsOutput } from './types';
import { getToolProtocols } from './index';

export type UseGetToolProtocols = [FunctionKeyV2.GET_TOOL_PROTOCOLS];

type Options = QueryObserverOptions<
  GetToolProtocolsOutput,
  Error,
  GetToolProtocolsOutput,
  GetToolProtocolsOutput,
  UseGetToolProtocols
>;

export const useGetToolProtocols = (
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_TOOL_PROTOCOLS],
    queryFn: () => getToolProtocols(),
    ...options,
  });
  return response;
};
