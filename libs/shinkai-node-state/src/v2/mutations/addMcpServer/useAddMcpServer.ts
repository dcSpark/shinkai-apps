import { McpServer } from '@shinkai_network/shinkai-message-ts/api/mcp-servers/types';
import { useMutation, UseMutationOptions,useQueryClient } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { addMcpServer } from './index';
import { AddMcpServerInput } from './types';

export const useAddMcpServer = (
  options?: UseMutationOptions<McpServer, Error, AddMcpServerInput>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddMcpServerInput) => addMcpServer(input),
    ...options,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_MCP_SERVERS],
      });
      if (options?.onSuccess) {
        await options.onSuccess(data, variables, context);
      }
    },
  });
}; 