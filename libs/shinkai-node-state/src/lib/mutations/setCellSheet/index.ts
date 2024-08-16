import { setCellSheet as setCellSheetAPI } from '@shinkai_network/shinkai-message-ts/api';

import { SetCellSheetInput } from './types';

export const setCellSheet = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  sheetId,
  columnId,
  rowId,
  value,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: SetCellSheetInput) => {
  return await setCellSheetAPI(
    nodeAddress,
    sheetId,
    columnId,
    rowId,
    value,
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
