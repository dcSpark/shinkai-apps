import type { JobCredentialsPayload } from "@shinkai_network/shinkai-message-ts/models";

export type SendMessageToJobInput = JobCredentialsPayload & {
  nodeAddress: string;
  jobId: string;
  message: string;
  files_inbox: string;
  parent: string | null;
  shinkaiIdentity: string;
  profile: string;
};
