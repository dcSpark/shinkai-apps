import { sendTextMessageWithFilesForInbox } from '@shinkai_network/shinkai-message-ts/api';

import { SendMessageWithFilesToInboxInput } from './types';

export const sendMessageWithFilesToInbox = async ({
  nodeAddress,
  sender,
  senderSubidentity,
  receiver,
  message,
  inboxId,
  files,
  workflow,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: SendMessageWithFilesToInboxInput) => {
  return await sendTextMessageWithFilesForInbox(
    nodeAddress,
    sender,
    senderSubidentity,
    receiver,
    message,
    inboxId,
    files,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    },
    workflow,
  );
};
