import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type UpdateWorkflowOutput = {
  status: string;
};

export type UpdateWorkflowInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  workflowRaw: string;
  workflowDescription: string;
};
