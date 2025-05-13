import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getToolPlaygroundMetadata } from '.';
import { GetToolPlaygroundMetadataInput, GetToolPlaygroundMetadataOutput } from './types';

export const useGetToolPlaygroundMetadata = (
  input: GetToolPlaygroundMetadataInput,
  options?: UseQueryOptions<
    GetToolPlaygroundMetadataOutput,
    Error,
    GetToolPlaygroundMetadataOutput,
    string[]
  >,
) => {
  return useQuery({
    queryKey: [FunctionKeyV2.GET_TOOL_PLAYGROUND_METADATA, input.toolRouterKey],
    queryFn: () => getToolPlaygroundMetadata(input),
    ...options,
  });
};
