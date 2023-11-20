import type {
  CredentialsPayload,
  ShinkaiMessage,
} from "@shinkai_network/shinkai-message-ts/models";

export type CreateChatInput = CredentialsPayload & {
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
