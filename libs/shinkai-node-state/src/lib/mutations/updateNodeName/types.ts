import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type UpdateNodeNameInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  newNodeName: string;
};

export type UpdateNodeNameOutput = {
  status: string;
};
