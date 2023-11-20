import { sendTextMessageWithInbox } from "@shinkai_network/shinkai-message-ts/api";

import { SendMessageToInboxInput } from "./types";

export const sendMessageToInbox = async ({
  sender,
  sender_subidentity,
  receiver,
  message,
  inboxId,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: SendMessageToInboxInput) => {
  return await sendTextMessageWithInbox(
    sender,
    sender_subidentity,
    receiver,
    message,
    inboxId,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    }
  );
};
