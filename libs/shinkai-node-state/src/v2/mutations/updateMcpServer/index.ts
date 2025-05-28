import { updateMcpServer as updateMcpServerApi } from '@shinkai_network/shinkai-message-ts/api/mcp-servers/index';
import { UpdateMcpServerRequest } from '@shinkai_network/shinkai-message-ts/api/mcp-servers/types';

import { UpdateMcpServerInput } from './types';

export const updateMcpServer = async (input: UpdateMcpServerInput) => {
  const { nodeAddress, token, ...rest } = input;
  return updateMcpServerApi(nodeAddress, token, rest as UpdateMcpServerRequest);
};