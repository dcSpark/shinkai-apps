import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';
import { ShinkaiMessage } from '@shinkai_network/shinkai-message-ts/models';

export type CreateJobInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  agentId: string;
  content: string;
  files_inbox: string;
  files?: File[];
  is_hidden?: boolean;
};

export type CreateJobOutput = {
  jobId: string;
  response:
    | string
    | {
        inboxId: string;
        message: ShinkaiMessage;
      };
};
