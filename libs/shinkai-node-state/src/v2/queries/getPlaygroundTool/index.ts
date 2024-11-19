import { getPlaygroundTool as getPlaygroundToolApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { GetPlaygroundToolInput } from './types';

export const getPlaygroundTool = async ({
  nodeAddress,
  token,
  toolRouterKey,
}: GetPlaygroundToolInput) => {
  const response = await getPlaygroundToolApi(nodeAddress, token, {
    tool_key: toolRouterKey,
  });
  return response;
};
