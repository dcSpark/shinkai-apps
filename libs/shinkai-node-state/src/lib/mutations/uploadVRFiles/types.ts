import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type UploadVRFilesOutput = CredentialsPayload & {
  nodeAddress: string;
  sender: string;
  sender_subidentity: string;
  receiver: string;
  message: string;
  inboxId: string;
};

export type UploadVRFilesInput = CredentialsPayload & {
  nodeAddress: string;
  sender: string;
  receiver: string;
  senderSubidentity: string;
  destinationPath: string;
  files: File[];
};
