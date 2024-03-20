import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type MoveVRFolderOutput = {
  status: string;
};

export type MoveVRFolderInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  originPath: string;
  destinationPath: string;
};
