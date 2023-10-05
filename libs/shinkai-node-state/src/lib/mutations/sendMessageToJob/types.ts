import type { JobCredentialsPayload } from "@shinkai_network/shinkai-message-ts/models";

export type SendMessageToJobInput = JobCredentialsPayload & {
  jobId: string;
  message: string;
  files_inbox: string;
  sender: string;
  shinkaiIdentity: string;
};
