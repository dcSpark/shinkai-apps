import { toggleEnableTool as toggleEnableToolApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { type ToggleEnableToolInput } from './types';

export const toggleEnableTool = async ({
  nodeAddress,
  token,
  toolKey,
  isToolEnabled,
}: ToggleEnableToolInput) => {
  const response = await toggleEnableToolApi(nodeAddress, token, {
    tool_router_key: toolKey,
    enabled: isToolEnabled,
  });
  return response;
};
