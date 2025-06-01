import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import {
  type SearchMcpServerRegistryInput,
  type SearchMcpServerRegistryResponse,
} from './types';
import { searchMcpServerRegistry } from './index';

export type UseSearchMcpServerRegistryKey = [
  FunctionKeyV2.SEARCH_MCP_SERVER_REGISTRY,
  SearchMcpServerRegistryInput,
];

type Options = QueryObserverOptions<
  SearchMcpServerRegistryResponse,
  Error,
  SearchMcpServerRegistryResponse,
  SearchMcpServerRegistryResponse,
  UseSearchMcpServerRegistryKey
>;

export const useSearchMcpServerRegistry = (
  input: SearchMcpServerRegistryInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: [FunctionKeyV2.SEARCH_MCP_SERVER_REGISTRY, input],
    queryFn: () => searchMcpServerRegistry(input),
    ...options,
  });
};
