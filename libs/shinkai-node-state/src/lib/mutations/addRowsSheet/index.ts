import { addRowsSheet as addRowsSheetAPI } from '@shinkai_network/shinkai-message-ts/api';

import { AddRowsSheetInput } from './types';

export const addRowsSheet = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  sheetId,
  numberOfRows,
  startingRow,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: AddRowsSheetInput) => {
  return await addRowsSheetAPI(
    nodeAddress,
    sheetId,
    numberOfRows,
    startingRow,
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
