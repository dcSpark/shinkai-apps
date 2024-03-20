import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type DeleteVRItemOutput = {
  status: string;
};

export type DeleteVRItemInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  itemPath: string;
};
