import { updateInboxName as updateInboxNameApi } from '@shinkai_network/shinkai-message-ts/api';
import { type ShinkaiMessage } from '@shinkai_network/shinkai-message-ts/models';

import { UpdateInboxNamebInput } from './types';
export type SmartInbox = {
  custom_name: string;
  inbox_id: string;
  last_message: ShinkaiMessage;
};

export const updateInboxName = async ({
  senderSubidentity,
  sender,
  receiver,
  receiverSubidentity,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
  inboxName,
  inboxId,
}: UpdateInboxNamebInput) => {
  const response = await updateInboxNameApi(
    sender,
    senderSubidentity,
    receiver,
    receiverSubidentity,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
    inboxName,
    inboxId
  );

  return response;
};
