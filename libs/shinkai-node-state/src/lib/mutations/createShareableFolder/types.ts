import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type CreateShareableFolderOutput = {
  status: string;
};

export type CreateShareableFolderInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  folderPath: string;
  folderDescription: string;
};
