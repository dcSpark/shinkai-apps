import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type UnsubscribeToSharedFolderOutput = {
  status: string;
};

export type UnsubscribeToSharedFolderInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  folderPath: string;
  streamerNodeName: string;
  streamerNodeProfile: string;
};
