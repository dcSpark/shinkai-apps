import { addNetworkTool as addNetworkToolApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';
import { type AddNetworkToolInput } from './types';

export const addNetworkTool = async ({
  nodeAddress,
  token,
  networkTool,
}: AddNetworkToolInput) => {
  return addNetworkToolApi(nodeAddress, token, {
    assets: [],
    tool: {
      type: 'Network',
      content: [networkTool, true],
    },
  });
};
