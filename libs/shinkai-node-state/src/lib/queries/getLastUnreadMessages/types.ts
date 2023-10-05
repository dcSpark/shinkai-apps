import type { JobCredentialsPayload } from "@shinkai_network/shinkai-message-ts/models";

export type GetLastUnreadMessagesInput = JobCredentialsPayload & {
  inboxId: string;
  count: number;
  lastKey?: string;
  shinkaiIdentity: string;
  profile: string;
};
