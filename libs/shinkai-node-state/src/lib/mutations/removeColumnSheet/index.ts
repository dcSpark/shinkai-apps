import { removeColumnSheet as removeColumnSheetAPI } from '@shinkai_network/shinkai-message-ts/api';

import { RemoveSheetColumnInput } from './types';

export const removeSheetColumn = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  sheetId,
  columnId,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: RemoveSheetColumnInput) => {
  return await removeColumnSheetAPI(
    nodeAddress,
    sheetId,
    columnId,
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
