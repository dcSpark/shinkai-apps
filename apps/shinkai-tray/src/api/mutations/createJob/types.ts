import type {
  JobCredentialsPayload,
  ShinkaiMessage,
} from "@shinkai_network/shinkai-message-ts/models";

export type CreateJobInput = JobCredentialsPayload & {
  shinkaiIdentity: string;
  profile: string;
  agentId: string;
  content: string;
  files_inbox: string;
  file: File;
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
