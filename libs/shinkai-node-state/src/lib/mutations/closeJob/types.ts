import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type CloseJobInput = JobCredentialsPayload & {
  shinkaiIdentity: string;
  profile: string;
  inboxId: string;
};

// TODO: remove this
// {"data":null,"status":"success"}
export type CloseJobOutput = {
  response: string;
};
