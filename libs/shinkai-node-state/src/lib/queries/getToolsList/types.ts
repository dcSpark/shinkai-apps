import {
  JobCredentialsPayload,
  Workflow,
} from '@shinkai_network/shinkai-message-ts/models';

export type GetToolsListInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
};

export type GetToolsListOutput = Workflow[];
