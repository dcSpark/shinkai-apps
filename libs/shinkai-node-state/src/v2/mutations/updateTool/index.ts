import { updateTool as updateToolApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { UpdateToolInput } from './types';

export const updateTool = async ({
  nodeAddress,
  toolKey,
  toolType,
  toolPayload,
  isToolEnabled,
}: UpdateToolInput) => {
  const response = await updateToolApi(nodeAddress, toolKey, {
    content: [toolPayload, isToolEnabled],
    type: toolType,
  });
  return response;
};
