import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type SubscribeToSharedFolderOutput = {
  status: string;
};

export type SubscribeToSharedFolderInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  folderPath: string;
  streamerNodeName: string;
  streamerNodeProfile: string;
};
