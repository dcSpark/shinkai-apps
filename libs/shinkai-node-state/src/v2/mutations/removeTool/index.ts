import {
  removePlaygroundTool as removePlaygroundToolApi,
  removeTool as removeToolApi,
} from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { RemoveToolInput } from './types';

export const removeTool = async ({
  nodeAddress,
  token,
  toolKey,
}: RemoveToolInput) => {
  // Endpoint attempts to remove tool from playground, but does not fail if it does not exist so it works even if the tool is not in the playground
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
