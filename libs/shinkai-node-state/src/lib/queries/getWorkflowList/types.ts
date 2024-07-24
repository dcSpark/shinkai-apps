import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type GetWorkflowListInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
};

export type Workflow = {
  description: string;
  name: string;
  raw: string;
  version: string;
};

export type GetWorkflowListOutput = Workflow[];
