import { removeSheet as removeSheetAPI } from '@shinkai_network/shinkai-message-ts/api';

import { RemoveSheetInput } from './types';

export const removeSheet = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  sheetId,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: RemoveSheetInput) => {
  return await removeSheetAPI(
    nodeAddress,
    sheetId,
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
