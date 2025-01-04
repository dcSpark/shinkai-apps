import { uploadFilesToVR } from '@shinkai_network/shinkai-message-ts/api';

import { UploadVRFilesInput } from './types';

export const uploadVRFiles = async ({
  nodeAddress,
  token,
  destinationPath,
  files,
}: UploadVRFilesInput) => {
  const response = await uploadFilesToVR(
    nodeAddress,
    token,
    destinationPath,
    files
  );

  return response;
};
