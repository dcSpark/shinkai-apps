import { createSheet as createSheetAPI } from '@shinkai_network/shinkai-message-ts/api';

import { CreateSheetInput } from './types';

export const createSheet = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  sheetName,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: CreateSheetInput) => {
  return await createSheetAPI(
    nodeAddress,
    shinkaiIdentity,
    profile,
    shinkaiIdentity,
    profile,
    sheetName,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
  );
};
