import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type UnshareFolderOutput = {
  status: string;
};

export type UnshareFolderInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  folderPath: string;
};
