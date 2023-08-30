import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type CreateVRFolderInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  path: string;
  folderName: string;
};

export type CreateVRFolderOutput = {
  status: string;
};
