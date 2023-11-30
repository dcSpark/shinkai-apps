import {
  closeJob as closeJobApi,
} from '@shinkai_network/shinkai-message-ts/api';

import { CloseJobInput, CloseJobOutput } from './types';

export const closeJob = async ({
  inboxId,
  shinkaiIdentity,
  profile,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: CloseJobInput): Promise<CloseJobOutput> => {
  const sender = shinkaiIdentity;
  const sender_subidentity = profile;

  try {
    const response = await closeJobApi(
      sender,
      sender_subidentity,
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

    console.log("response: ", response);

    return { response: "ok" };
  } catch (error) {
    console.error('Error closing job:', error);
    throw error;
  }
};
