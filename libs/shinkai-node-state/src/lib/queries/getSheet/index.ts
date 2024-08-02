import { getSheet as getSheetAPI } from '@shinkai_network/shinkai-message-ts/api';

import { GetSheetInput, GetSheetOutput } from './types';

export const getSheet = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  sheetId,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: GetSheetInput): Promise<GetSheetOutput> => {
  const response = await getSheetAPI(
    nodeAddress,
    sheetId,
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
