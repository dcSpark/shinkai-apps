import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getMcpServers } from './index';
import { GetMcpServersInput } from './types';

export const useGetMcpServers = (input: GetMcpServersInput) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_MCP_SERVERS],
    queryFn: () => getMcpServers(input),
  });
  return response;
};
