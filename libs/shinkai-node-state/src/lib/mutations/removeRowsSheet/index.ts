import { removeRowsSheet as removeRowsSheetAPI } from '@shinkai_network/shinkai-message-ts/api';

import { RemoveRowsSheetInput } from './types';

export const removeRowsSheet = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  sheetId,
  rowIds,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: RemoveRowsSheetInput) => {
  return await removeRowsSheetAPI(
    nodeAddress,
    sheetId,
    rowIds,
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
