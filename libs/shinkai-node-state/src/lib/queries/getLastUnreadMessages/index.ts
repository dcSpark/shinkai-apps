import type { ShinkaiMessage } from "@shinkai_network/shinkai-message-ts/models";

import { getLastUnreadMessagesFromInbox } from "@shinkai_network/shinkai-message-ts/api";

import { GetLastUnreadMessagesInput } from "./types";

export const getLastUnreadMessages = async ({
  inboxId,
  count,
  lastKey,
  shinkaiIdentity,
  profile,
  profile_encryption_sk,
  profile_identity_sk,
  node_encryption_pk,
}: GetLastUnreadMessagesInput) => {
  const data: ShinkaiMessage[] = await getLastUnreadMessagesFromInbox(
    inboxId,
    count,
    lastKey,
    {
      shinkai_identity: shinkaiIdentity,
      profile: profile,
      profile_encryption_sk,
      profile_identity_sk,
      node_encryption_pk,
    }
  );
  return data;
};
