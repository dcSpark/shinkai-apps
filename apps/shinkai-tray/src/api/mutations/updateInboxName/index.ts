import { updateInboxName as updateInboxNameApi } from "@shinkai_network/shinkai-message-ts/api";

export const updateInboxName = async ({
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
}: {
  senderSubidentity: string;
  sender: string;
  receiver: string;
  receiverSubidentity: string;
  my_device_encryption_sk: string;
  my_device_identity_sk: string;
  node_encryption_pk: string;
  profile_encryption_sk: string;
  profile_identity_sk: string;
  inboxName: string;
  inboxId: string;
}) => {
  const response = await updateInboxNameApi(
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
    inboxId
  );
  return response;
};
