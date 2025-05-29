import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getMcpServerTools } from '.';
import type { GetMcpServerToolsInput } from './types';

export const useGetMCPServerTools = (input: GetMcpServerToolsInput) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_MCP_SERVER_TOOLS, input],
    queryFn: () => getMcpServerTools(input),
  });
  return response;
};
