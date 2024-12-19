import { uploadAssetsToTool as uploadAssetsToToolApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { UploadAssetsToToolInput } from './types';

export const uploadAssetsToTool = async ({
  nodeAddress,
  token,
  files,
  xShinkaiAppId,
  xShinkaiToolId,
}: UploadAssetsToToolInput) => {
  const response = await uploadAssetsToToolApi(
    nodeAddress,
    token,
    xShinkaiAppId,
    xShinkaiToolId,
    files,
  );

  return response;
};
