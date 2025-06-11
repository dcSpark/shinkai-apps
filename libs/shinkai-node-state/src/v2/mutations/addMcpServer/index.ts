import { addMcpServer as addMcpServerApi } from '@shinkai_network/shinkai-message-ts/api/mcp-servers/index';
import { type AddMcpServerRequest } from '@shinkai_network/shinkai-message-ts/api/mcp-servers/types';

import { type AddMcpServerInput } from './types';

export const addMcpServer = async (input: AddMcpServerInput) => {
  const { nodeAddress, token, ...rest } = input;
  return addMcpServerApi(nodeAddress, token, rest as AddMcpServerRequest);
};
