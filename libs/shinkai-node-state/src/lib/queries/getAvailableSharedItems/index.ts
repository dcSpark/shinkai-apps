import { getAvailableSharedItems as getAvailableSharedItemsAPI } from '@shinkai_network/shinkai-message-ts/api';

import {
  GetAvailableSharedItemsInput,
  GetAvailableSharedItemsOutput,
} from './types';

export const getAvailableSharedItems = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: GetAvailableSharedItemsInput): Promise<GetAvailableSharedItemsOutput> => {
  const response = await getAvailableSharedItemsAPI(
    nodeAddress,
    shinkaiIdentity,
    profile,
    shinkaiIdentity,
    profile,
    shinkaiIdentity,
    profile,
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
