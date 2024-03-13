import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type GetVRPathSimplifiedInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  path: string;
};

export type GetVRPathSimplifiedOutput = {
  status: string;
};
