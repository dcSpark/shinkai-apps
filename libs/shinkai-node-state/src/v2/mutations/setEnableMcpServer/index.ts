import { setEnableMcpServer as setEnableMcpServerApi } from '@shinkai_network/shinkai-message-ts/api/mcp-servers/index';

import { SetEnableMcpServerInput } from './types';

export const setEnableMcpServer = async ({
  nodeAddress,
  token,
  mcpServerId,
  isEnabled,
}: SetEnableMcpServerInput) => {
  const response = await setEnableMcpServerApi(
    nodeAddress,
    token,
    mcpServerId,
    isEnabled,
  );
  return response;
}; 