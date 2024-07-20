import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type RemoveWorkflowOutput = {
  status: string;
};

export type RemoveWorkflowInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  workflowKey: string;
};
