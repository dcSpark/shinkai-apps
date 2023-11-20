import { sendTextMessageWithFilesForInbox } from "@shinkai_network/shinkai-message-ts/api";

import { SendMessageWithFilesToInboxInput } from "./types";

export const sendMessageWithFilesToInbox = async ({
  sender,
  senderSubidentity,
  receiver,
  message,
  inboxId,
  file,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: SendMessageWithFilesToInboxInput) => {
  return await sendTextMessageWithFilesForInbox(
    sender,
    senderSubidentity,
    receiver,
    message,
    inboxId,
    file,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    }
  );
};
