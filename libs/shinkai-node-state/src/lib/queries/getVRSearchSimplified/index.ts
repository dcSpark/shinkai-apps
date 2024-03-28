import { retrieveVectorSearchSimplified as retrieveVectorSearchSimplifiedApi } from '@shinkai_network/shinkai-message-ts/api';

import {
  GetVRSearchSimplifiedInput,
  GetVRSearchSimplifiedOutput,
} from './types';

export const getVRSearchSimplified = async ({
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
}: GetVRSearchSimplifiedInput): Promise<GetVRSearchSimplifiedOutput> => {
  const response = await retrieveVectorSearchSimplifiedApi(
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
