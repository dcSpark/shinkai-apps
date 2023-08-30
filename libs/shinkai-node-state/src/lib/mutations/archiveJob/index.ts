import { archiveJob as archiveJobApi } from '@shinkai_network/shinkai-message-ts/api';

import { ArchiveJobInput, ArchiveJobOutput } from './types';

export const archiveJob = async ({
  nodeAddress,
  inboxId,
  shinkaiIdentity,
  profile,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: ArchiveJobInput): Promise<ArchiveJobOutput> => {
  try {
    const response = await archiveJobApi(
      nodeAddress,
      shinkaiIdentity,
      profile,
      shinkaiIdentity,
      profile,
      inboxId,
      {
        my_device_encryption_sk: my_device_encryption_sk,
        my_device_identity_sk: my_device_identity_sk,
        node_encryption_pk: node_encryption_pk,
        profile_encryption_sk,
        profile_identity_sk,
      },
    );

    return response;
  } catch (error) {
    console.error('Error closing job:', error);
    throw error;
  }
};
