import { downloadVectorResource as downloadVRFileAPI } from '@shinkai_network/shinkai-message-ts/api';

import { DownloadVRFileInput } from './types';

export const downloadVRFile = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  path,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: DownloadVRFileInput) => {
  return await downloadVRFileAPI(
    nodeAddress,
    path,
    shinkaiIdentity,
    profile,
    shinkaiIdentity,
    profile,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
  );
};
