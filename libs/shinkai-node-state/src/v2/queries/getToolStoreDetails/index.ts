import { getToolStoreDetails as getToolStoreDetailsApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { type GetToolStoreDetailsInput } from './types';

export const getToolStoreDetails = async ({
  nodeAddress,
  token,
  toolRouterKey,
}: GetToolStoreDetailsInput) => {
  const response = await getToolStoreDetailsApi(nodeAddress, token, {
    tool_router_key: toolRouterKey,
  });
  return response;
};
