import {
  updateInboxName as updateInboxNameApi,
} from '@shinkai_network/shinkai-message-ts/api';
import {
  type ShinkaiMessage,
} from "@shinkai_network/shinkai-message-ts/models";
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
  profile_identity_sk, // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inboxName,
  inboxId, // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  console.log("updateInboxName response:", response);

  return response;
};
