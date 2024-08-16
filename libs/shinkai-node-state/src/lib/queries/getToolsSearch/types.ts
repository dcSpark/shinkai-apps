import type {
  JobCredentialsPayload,
  Workflow,
} from '@shinkai_network/shinkai-message-ts/models';

export type GetWorkflowSearchInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  search: string;
};

export type GetWorkflowSearchOutput = Workflow[];
