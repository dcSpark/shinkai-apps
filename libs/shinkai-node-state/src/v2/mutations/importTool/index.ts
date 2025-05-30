import { importTool as importToolApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { type ImportToolInput } from './types';

export const importTool = async ({
  nodeAddress,
  token,
  url,
}: ImportToolInput) => {
  return await importToolApi(nodeAddress, token, {
    url: url,
  });
};
