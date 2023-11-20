import { createChatWithMessage } from "@shinkai_network/shinkai-message-ts/api";

import { CreateChatInput } from "./types";

export const createChat = async ({
  sender,
  senderSubidentity,
  receiver,
  receiverSubidentity,
  message,
  my_device_encryption_sk,
  my_device_identity_sk,
  node_encryption_pk,
  profile_encryption_sk,
  profile_identity_sk,
}: CreateChatInput) => {
  const response = await createChatWithMessage(
    sender,
    senderSubidentity,
    receiver,
    receiverSubidentity,
    message,
    {
      my_device_encryption_sk,
      my_device_identity_sk,
      node_encryption_pk,
      profile_encryption_sk,
      profile_identity_sk,
    }
  );
  return response;
};
