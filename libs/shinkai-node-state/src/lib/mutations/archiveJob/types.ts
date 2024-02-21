import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type ArchiveJobInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  inboxId: string;
};

export type ArchiveJobOutput = {
  status: string;
};
