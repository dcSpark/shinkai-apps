import type { ShinkaiMessage } from "@shinkai_network/shinkai-message-ts/models";

import { getLastMessagesFromInbox } from "@shinkai_network/shinkai-message-ts/api";

import { GetChatConversationInput } from "./types";
import { CONVERSATION_PAGINATION_LIMIT } from "./useGetChatConversationWithPagination";

export const getChatConversation = async ({
  inboxId,
  count = CONVERSATION_PAGINATION_LIMIT,
  lastKey,
  shinkaiIdentity,
  profile,
  profile_encryption_sk,
  profile_identity_sk,
  node_encryption_pk,
}: GetChatConversationInput) => {
  const data: ShinkaiMessage[] = await getLastMessagesFromInbox(inboxId, count, lastKey, {
    shinkai_identity: shinkaiIdentity,
    profile: profile,
    profile_encryption_sk,
    profile_identity_sk,
    node_encryption_pk,
  });
  return data;
};
