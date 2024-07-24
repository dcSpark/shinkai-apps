import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type CreateWorkflowOutput = {
  status: string;
};

export type CreateWorkflowInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  workflowRaw: string;
  workflowDescription: string;
};
