import {
  removePlaygroundTool as removePlaygroundToolApi,
  removeTool as removeToolApi,
} from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { RemoveToolInput } from './types';

export const removeTool = async ({
  nodeAddress,
  token,
  toolKey,
  isPlaygroundTool,
}: RemoveToolInput) => {
  if (isPlaygroundTool) {
    return await removePlaygroundTool({ nodeAddress, token, toolKey });
  }
  return await removeToolApi(nodeAddress, token, {
    tool_key: toolKey,
  });
};

export const removePlaygroundTool = async ({
  nodeAddress,
  token,
  toolKey,
}: RemoveToolInput) => {
  return await removePlaygroundToolApi(nodeAddress, token, {
    tool_key: toolKey,
  });
};
