import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type UpdateToolOutput = {
  status: string;
};

export type UpdateToolInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  // workflowRaw: string;
  // workflowDescription: string;
};
