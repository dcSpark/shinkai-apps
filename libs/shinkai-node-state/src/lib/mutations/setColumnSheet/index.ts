import { setColumnSheet as setColumnSheetAPI } from '@shinkai_network/shinkai-message-ts/api';
import { createFilesInbox } from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { SetSheetColumnInput } from './types';

export const setColumnSheet = async ({
  nodeAddress,
  shinkaiIdentity,
  profile,
  sheetId,
  columnId,
  columnName,
  columnBehavior,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
  token,
}: SetSheetColumnInput) => {
  let columnBehaviorFormatted = columnBehavior;
  if (typeof columnBehavior === 'object' && 'UploadedFiles' in columnBehavior) {
    const folderId = await createFilesInbox(nodeAddress, token);
    columnBehaviorFormatted = {
      UploadedFiles: {
        fileInboxId: folderId,
      },
    };
  }
  return await setColumnSheetAPI(
    nodeAddress,
    sheetId,
    columnId,
    columnName,
    columnBehaviorFormatted,
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
