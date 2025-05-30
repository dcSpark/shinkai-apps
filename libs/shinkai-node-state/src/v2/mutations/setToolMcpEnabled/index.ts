import { setToolMcpEnabled as setToolMcpEnabledApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { type SetToolMcpEnabledInput } from './types';

export const setToolMcpEnabled = async ({
  nodeAddress,
  token,
  toolRouterKey,
  mcpEnabled,
}: SetToolMcpEnabledInput) => {
  const response = await setToolMcpEnabledApi(
    nodeAddress,
    token,
    toolRouterKey,
    mcpEnabled,
  );
  return response;
};
