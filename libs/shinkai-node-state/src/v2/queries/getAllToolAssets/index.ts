import { getAllToolAssets as getAllToolAssetsApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import  { type GetAllToolAssetsInput } from './types';

export const getAllToolAssets = async ({
  nodeAddress,
  token,
  xShinkaiAppId,
  xShinkaiToolId,
}: GetAllToolAssetsInput) => {
  const result = await getAllToolAssetsApi(
    nodeAddress,
    token,
    xShinkaiAppId,
    xShinkaiToolId,
  );
  return result;
};
