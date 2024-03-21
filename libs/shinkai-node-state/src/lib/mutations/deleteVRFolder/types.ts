import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type DeleteVRFolderOutput = {
  status: string;
};

export type DeleteVRFolderInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  folderPath: string;
};
