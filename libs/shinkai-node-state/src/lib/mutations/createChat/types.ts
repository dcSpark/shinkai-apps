import type {
  CredentialsPayload,
  ShinkaiMessage,
} from "@shinkai_network/shinkai-message-ts/models";

export type CreateChatInput = Pick<
  CredentialsPayload,
  "my_device_encryption_sk" | "my_device_identity_sk" | "node_encryption_pk"
> & {
  sender: string;
  senderSubidentity: string;
  receiver: string;
  receiverSubidentity: string;
  message: string;
};

export type CreateChatOutput = {
  inboxId: string;
  message: ShinkaiMessage;
};
