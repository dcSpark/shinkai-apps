import { updateInboxName as updateInboxNameApi } from '@shinkai_network/shinkai-message-ts/api';

import { UpdateInboxNameInput } from './types';
export const updateInboxName = async ({
  nodeAddress,
  senderSubidentity,
  sender,
  receiver,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
  inboxName,
  inboxId,
}: UpdateInboxNameInput) => {
  const response = await updateInboxNameApi(
    nodeAddress,
    sender,
    senderSubidentity,
    receiver,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
    inboxName,
    inboxId,
  );

  return response;
};
