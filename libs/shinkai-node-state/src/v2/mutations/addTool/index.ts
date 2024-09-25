import { addTool as addToolApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { AddToolInput } from './types';

export const addTool = async ({
  nodeAddress,
  token,
  toolPayload,
  toolType,
  isToolEnabled,
}: AddToolInput) => {
  const response = await addToolApi(nodeAddress, token, {
    content: [toolPayload, isToolEnabled],
    type: toolType,
  });
  return response;
};
