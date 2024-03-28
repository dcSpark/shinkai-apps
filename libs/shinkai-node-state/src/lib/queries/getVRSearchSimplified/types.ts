import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type GetVRSearchSimplifiedInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  path?: string;
  search: string;
};

export type SearchResult = [string, string[], number];
export type GetVRSearchSimplifiedOutput = SearchResult[];
