import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type GetWorkflowSearchInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  search: string;
};

export type WorkflowSearch = {
  Workflow: {
    embedding: null;
    workflow: {
      description: string;
      name: string;
      raw: string;
      version: string;
    };
  };
};

export type GetWorkflowSearchOutput = WorkflowSearch[];
