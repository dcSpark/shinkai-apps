import { removeToolAsset as removeToolAssetApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { RemoveAssetToToolInput } from './types';

export const removeToolAsset = async ({
  nodeAddress,
  token,
  filename,
  xShinkaiAppId,
  xShinkaiToolId,
}: RemoveAssetToToolInput) => {
  const response = await removeToolAssetApi(
    nodeAddress,
    token,
    { filename },
    xShinkaiAppId,
    xShinkaiToolId,
  );

  return response;
};
