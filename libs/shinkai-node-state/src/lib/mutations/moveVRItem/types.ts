import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type MoveVRItemOutput = {
  status: string;
};

export type MoveVRItemInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  originPath: string;
  destinationPath: string;
};
