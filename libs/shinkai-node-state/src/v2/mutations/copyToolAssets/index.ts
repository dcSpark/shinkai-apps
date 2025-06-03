import { copyToolAssets as copyToolAssetsApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { type CopyToolAssetsInput } from './types';

export const copyToolAssets = async ({
  nodeAddress,
  token,
  xShinkaiAppId,
  currentToolKeyPath,
}: CopyToolAssetsInput) => {
  return await copyToolAssetsApi(nodeAddress, token, {
    is_first_playground: false,
    first_path: currentToolKeyPath,
    second_path: xShinkaiAppId,
    is_second_playground: true,
  });
};
