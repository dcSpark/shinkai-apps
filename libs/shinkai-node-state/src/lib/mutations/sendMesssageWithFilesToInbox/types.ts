import type {
  CredentialsPayload,
  ShinkaiMessage,
} from '@shinkai_network/shinkai-message-ts/models';

export type SendMessageWithFilesToInboxInput = CredentialsPayload & {
  nodeAddress: string;
  sender: string;
  receiver: string;
  senderSubidentity: string;
  message: string;
  inboxId: string;
  workflow?: string;
  workflowName?: string;
  files: File[];
};
export type SendMessageWithFilesToInboxOutput = {
  inboxId: string;
  message: ShinkaiMessage;
};
