import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type CopyVRFolderOutput = {
  status: string;
};

export type CopyVRFolderInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  originPath: string;
  destinationPath: string;
};
