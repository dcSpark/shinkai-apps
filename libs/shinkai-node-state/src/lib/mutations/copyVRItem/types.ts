import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type CopyVRItemOutput = {
  status: string;
};

export type CopyVRItemInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  originPath: string;
  destinationPath: string;
};
