import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type UpdateAgentInJobInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  jobId: string;
  newAgentId: string;
};

export type UpdateAgentInJobOutput = {
  data: string;
};
