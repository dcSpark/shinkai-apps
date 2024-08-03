import { setColumnSheet as setSheetColumnAPI } from '@shinkai_network/shinkai-message-ts/api';

import { SetSheetColumnInput } from './types';

export const setSheetColumn = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  sheetId,
  columnName,
  columnBehavior,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: SetSheetColumnInput) => {
  return await setSheetColumnAPI(
    nodeAddress,
    sheetId,
    columnName,
    columnBehavior,
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
