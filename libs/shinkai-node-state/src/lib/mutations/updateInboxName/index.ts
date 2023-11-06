import { ApiConfig, handleHttpError } from "@shinkai_network/shinkai-message-ts/api";
import {
  type CredentialsPayload,
  type ShinkaiMessage,
} from "@shinkai_network/shinkai-message-ts/models";
import {
  ShinkaiMessageBuilderWrapper,
} from "@shinkai_network/shinkai-message-ts/wasm";

export type SmartInbox = {
  custom_name: string;
  inbox_id: string;
  last_message: ShinkaiMessage;
};

export const updateInboxNameApi = async (
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: CredentialsPayload,
  inboxName: string,
  inboxId: string
): Promise<SmartInbox[]> => {
  try {
    const messageString = ShinkaiMessageBuilderWrapper.update_shinkai_inbox_name(
      setupDetailsState.my_device_encryption_sk,
      setupDetailsState.my_device_identity_sk,
      setupDetailsState.node_encryption_pk,
      sender,
      sender_subidentity,
      receiver,
      receiver_subidentity,
      inboxId,
      inboxName
    );

    const message = JSON.parse(messageString);

    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(`${apiEndpoint}/v1/update_smart_inbox_name`, {
      method: "POST",
      body: JSON.stringify(message),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    await handleHttpError(response);
    return data.data;
  } catch (error) {
    console.error("Error updating inbox name:", error);
    throw error;
  }
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
