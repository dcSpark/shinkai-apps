import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type UploadVRFilesOutput = {
  status: string;
};

export type UploadVRFilesInput = CredentialsPayload & {
  nodeAddress: string;
  sender: string;
  receiver: string;
  senderSubidentity: string;
  destinationPath: string;
  files: File[];
};
