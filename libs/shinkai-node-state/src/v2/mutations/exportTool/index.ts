import { exportTool as exportToolApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { ExportToolInput } from './types';

export const exportTool = async ({
  nodeAddress,
  token,
  toolKey,
}: ExportToolInput) => {
  return await exportToolApi(nodeAddress, token, {
    toolKey,
  });
};
