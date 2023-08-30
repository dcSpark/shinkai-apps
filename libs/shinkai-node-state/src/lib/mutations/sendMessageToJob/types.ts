import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type SendMessageToJobInput = JobCredentialsPayload & {
  nodeAddress: string;
  jobId: string;
  message: string;
  files_inbox: string;
  parent: string | null;
  shinkaiIdentity: string;
  profile: string;
};

export type SendMessageToJobOutput = {
  message_id: string;
  parent_message_id: string;
  inbox: string;
  scheduled_time: string;
};
