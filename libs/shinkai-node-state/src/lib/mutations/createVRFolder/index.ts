import { createVRFolder as createVRFolderApi } from '@shinkai_network/shinkai-message-ts/api';

import { CreateVRFolderInput, CreateVRFolderOutput } from './types';

export const createVRFolder = async ({
  nodeAddress,
  folderName,
  path,
  shinkaiIdentity,
  profile,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: CreateVRFolderInput): Promise<CreateVRFolderOutput> => {
  const response = await createVRFolderApi(
    nodeAddress,
    shinkaiIdentity,
    profile,
    shinkaiIdentity,
    profile,
    folderName,
    path,
    {
      my_device_encryption_sk: my_device_encryption_sk,
      my_device_identity_sk: my_device_identity_sk,
      node_encryption_pk: node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
  );

  return response;
};
