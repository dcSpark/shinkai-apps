import { McpServer } from '@shinkai_network/shinkai-message-ts/api/mcp-servers/types';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

import { addMcpServer } from './index';
import { AddMcpServerInput } from './types';

export const useAddMcpServer = (
  options?: UseMutationOptions<McpServer, Error, AddMcpServerInput>
) => {
  return useMutation({
    mutationFn: (input: AddMcpServerInput) => addMcpServer(input),
    ...options,
  });
}; 