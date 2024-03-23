import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type GetVRSearchItemsInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  path: string;
  search: string;
};
export type GetVRSearchItemsOutput = string[];
