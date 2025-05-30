import { uploadPlaygroundToolFiles as uploadPlaygroundToolFilesApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { type UploadPlaygroundToolFilesInput } from './types';

export const uploadPlaygroundToolFiles = async ({
  nodeAddress,
  token,
  files,
  xShinkaiAppId,
  xShinkaiToolId,
}: UploadPlaygroundToolFilesInput) => {
  const response = await uploadPlaygroundToolFilesApi(
    nodeAddress,
    token,
    xShinkaiAppId,
    xShinkaiToolId,
    files,
  );

  return response;
};
