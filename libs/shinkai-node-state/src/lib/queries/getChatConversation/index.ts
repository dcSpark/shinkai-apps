import { getFileNames, getLastMessagesFromInbox } from "@shinkai_network/shinkai-message-ts/api";
import type { ShinkaiMessage } from "@shinkai_network/shinkai-message-ts/models";
import { calculateMessageHash, getMessageContent, getMessageFilesInbox, isLocalMessage } from "@shinkai_network/shinkai-message-ts/utils";

import { ChatConversationMessage, GetChatConversationInput } from "./types";
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
}: GetChatConversationInput): Promise<ChatConversationMessage[]> => {
  const data: ShinkaiMessage[] = await getLastMessagesFromInbox(inboxId, count, lastKey, {
    shinkai_identity: shinkaiIdentity,
    profile: profile,
    profile_encryption_sk,
    profile_identity_sk,
    node_encryption_pk,
  });
  const transformedMessagePromises: Promise<ChatConversationMessage>[] = data.map(async (shinkaiMessage) => {
    const filesInbox = getMessageFilesInbox(shinkaiMessage);
    const content = getMessageContent(shinkaiMessage);
    const isLocal = isLocalMessage(shinkaiMessage, shinkaiIdentity, profile);
    const message: ChatConversationMessage = {
      hash: calculateMessageHash(shinkaiMessage),
      inboxId,
      content,
      sender: {
        avatar: isLocal
        ? 'https://ui-avatars.com/api/?name=Me&background=363636&color=fff'
        : 'https://ui-avatars.com/api/?name=S&background=FE6162&color=fff',
      },
      isLocal,
      scheduledTime: shinkaiMessage.external_metadata?.scheduled_time,
    };
    if (filesInbox) {
      const fileNames = await getFileNames(shinkaiIdentity, profile, shinkaiIdentity, {
        profile_encryption_sk: profile_encryption_sk,
        profile_identity_sk: profile_identity_sk,
        node_encryption_pk: node_encryption_pk,
      }, inboxId, filesInbox);
      message.fileInbox = {
        id: filesInbox,
        files: (fileNames.data || []).map(fileName => ({ name: fileName })),
      };
    }
    return message;
  });
  return Promise.all(transformedMessagePromises);
};
