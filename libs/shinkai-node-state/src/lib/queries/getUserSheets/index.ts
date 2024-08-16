import { getUserSheets as getUserSheetsAPI } from '@shinkai_network/shinkai-message-ts/api';

import { GetUserSheetsInput, GetUserSheetsOutput } from './types';

export const getUserSheets = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: GetUserSheetsInput): Promise<GetUserSheetsOutput> => {
  const response = await getUserSheetsAPI(
    nodeAddress,
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
