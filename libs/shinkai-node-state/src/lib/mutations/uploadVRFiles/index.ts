import { uploadFilesToVR } from '@shinkai_network/shinkai-message-ts/api';

import { UploadVRFilesInput } from './types';

export const uploadVRFiles = async ({
  nodeAddress,
  sender,
  senderSubidentity,
  receiver,
  destinationPath,
  files,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: UploadVRFilesInput) => {
  return await uploadFilesToVR(
    nodeAddress,
    sender,
    senderSubidentity,
    receiver,
    destinationPath,
    files,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
  );
};
