import {
  JobCredentialsPayload,
  Workflow,
} from '@shinkai_network/shinkai-message-ts/models';

export type GetWorkflowListInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
};

export type GetWorkflowListOutput = Workflow[];
