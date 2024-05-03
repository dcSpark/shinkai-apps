import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type DownloadVRFileOutput = {
  status: string;
  data: string;
};

export type DownloadVRFileInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  path: string;
};
