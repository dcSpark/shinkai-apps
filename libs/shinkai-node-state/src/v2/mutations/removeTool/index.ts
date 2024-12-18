import { removePlaygroundTool as removePlaygroundToolApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { RemoveToolInput } from './types';

export const removeTool = async ({
  nodeAddress,
  token,
  toolKey,
}: RemoveToolInput) => {
  return await removePlaygroundToolApi(nodeAddress, token, {
    tool_key: toolKey,
  });
};
