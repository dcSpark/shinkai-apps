import { deleteMcpServer as deleteMcpServerApi } from '@shinkai_network/shinkai-message-ts/api/mcp-servers/index';

import { DeleteMcpServerInput } from './types';

export const deleteMcpServer = async (input: DeleteMcpServerInput) => {
  const { nodeAddress, token, id } = input;
  return deleteMcpServerApi(nodeAddress, token, { id });
}; 