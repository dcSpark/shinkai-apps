import { searchItemsVR as searchItemsVRApi } from '@shinkai_network/shinkai-message-ts/api';

import { GetVRSearchItemsInput, GetVRSearchItemsOutput } from './types';

export const getSearchVRItems = async ({
  nodeAddress,
  path,
  search,
  shinkaiIdentity,
  profile,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: GetVRSearchItemsInput): Promise<GetVRSearchItemsOutput> => {
  const response = await searchItemsVRApi(
    nodeAddress,
    shinkaiIdentity,
    profile,
    shinkaiIdentity,
    profile,
    search,
    path,
    {
      my_device_encryption_sk: my_device_encryption_sk,
      my_device_identity_sk: my_device_identity_sk,
      node_encryption_pk: node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
  );

  return response.data;
};
