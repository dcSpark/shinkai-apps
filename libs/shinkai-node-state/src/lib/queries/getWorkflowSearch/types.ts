import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type GetWorkflowSearchInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  search: string;
};

interface Workflow {
  description: string;
  name: string;
  raw: string;
  // steps: ;
  version: string;
}

export type GetWorkflowSearchOutput = {
  Workflow: {
    embedding: null;
    workflow: Workflow;
  };
}[];
