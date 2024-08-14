import {
  JobCredentialsPayload,
  Workflow,
} from '@shinkai_network/shinkai-message-ts/models';

export type GetToolInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  toolKey: string;
};

export type GetToolOutput = Workflow[];
