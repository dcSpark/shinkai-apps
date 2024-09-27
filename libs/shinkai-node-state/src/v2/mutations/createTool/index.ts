import { createTool as createToolApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { CreateToolInput } from './types';

export const createTool = async ({
  nodeAddress,
  token,
  toolPayload,
  toolType,
  isToolEnabled,
}: CreateToolInput) => {
  const response = await createToolApi(nodeAddress, token, {
    content: [toolPayload, isToolEnabled],
    type: toolType,
  });
  return response;
};
