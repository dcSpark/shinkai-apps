import { McpServer } from '@shinkai_network/shinkai-message-ts/api/mcp-servers/types';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

import { deleteMcpServer } from './index';
import { DeleteMcpServerInput } from './types';

export const useDeleteMcpServer = (
  options?: UseMutationOptions<McpServer, Error, DeleteMcpServerInput>
) => {
  return useMutation({
    mutationFn: (input: DeleteMcpServerInput) => deleteMcpServer(input),
    ...options,
  });
}; 