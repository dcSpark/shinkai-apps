import { McpServer } from '@shinkai_network/shinkai-message-ts/api/mcp-servers/types';
import { useMutation, UseMutationOptions,useQueryClient } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { deleteMcpServer } from './index';
import { DeleteMcpServerInput } from './types';

export const useDeleteMcpServer = (
  options?: UseMutationOptions<McpServer, Error, DeleteMcpServerInput>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeleteMcpServerInput) => deleteMcpServer(input),
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