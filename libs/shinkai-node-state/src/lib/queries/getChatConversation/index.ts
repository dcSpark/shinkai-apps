import {
  getFileNames,
  getLastMessagesFromInboxWithBranches,
} from '@shinkai_network/shinkai-message-ts/api';
import type { ShinkaiMessage } from '@shinkai_network/shinkai-message-ts/models';
import {
  getMessageContent,
  getMessageFilesInbox,
  getWorkflowNameJobMessage,
  isLocalMessage,
} from '@shinkai_network/shinkai-message-ts/utils';

import {
  ChatConversationMessage,
  GetChatConversationInput,
  GetChatConversationOutput,
} from './types';
import { CONVERSATION_PAGINATION_LIMIT } from './useGetChatConversationWithPagination';

export const getChatConversation = async ({
  nodeAddress,
  inboxId,
  count = CONVERSATION_PAGINATION_LIMIT,
  lastKey,
  shinkaiIdentity,
  profile,
  profile_encryption_sk,
  profile_identity_sk,
  node_encryption_pk,
}: GetChatConversationInput): Promise<GetChatConversationOutput> => {
  const data: ShinkaiMessage[][] = await getLastMessagesFromInboxWithBranches(
    nodeAddress,
    inboxId,
    count,
    lastKey,
    {
      shinkai_identity: shinkaiIdentity,
      profile: profile,
      profile_encryption_sk,
      profile_identity_sk,
      node_encryption_pk,
    },
  );
  const flattenMessages: ShinkaiMessage[] = data.flat(1);

  const transformedMessagePromises: Promise<ChatConversationMessage>[] =
    flattenMessages.map(async (shinkaiMessage) => {
      const filesInbox = getMessageFilesInbox(shinkaiMessage);
      const workflowName = getWorkflowNameJobMessage(shinkaiMessage);
      const content = getMessageContent(shinkaiMessage);
      const isLocal = isLocalMessage(shinkaiMessage, shinkaiIdentity, profile);
      const message: ChatConversationMessage = {
        hash:
          shinkaiMessage.body && 'unencrypted' in shinkaiMessage.body
            ? shinkaiMessage.body.unencrypted.internal_metadata?.node_api_data
                ?.node_message_hash
            : '',
        parentHash:
          shinkaiMessage.body && 'unencrypted' in shinkaiMessage.body
            ? shinkaiMessage.body.unencrypted.internal_metadata?.node_api_data
                ?.parent_hash
            : '',
        inboxId,
        content,
        workflowName,
        sender: {
          avatar: isLocal
            ? 'https://ui-avatars.com/api/?name=Me&background=313336&color=b0b0b0'
            : 'https://ui-avatars.com/api/?name=S&background=FF7E7F&color=ffffff',
        },
        isLocal,
        scheduledTime:
          shinkaiMessage.body && 'unencrypted' in shinkaiMessage.body
            ? shinkaiMessage.body.unencrypted.internal_metadata?.node_api_data
                ?.node_timestamp
            : '',
      };
      if (filesInbox) {
        const fileNames = await getFileNames(
          nodeAddress,
          shinkaiIdentity,
          profile,
          shinkaiIdentity,
          {
            profile_encryption_sk: profile_encryption_sk,
            profile_identity_sk: profile_identity_sk,
            node_encryption_pk: node_encryption_pk,
          },
          inboxId,
          filesInbox,
        );
        message.fileInbox = {
          id: filesInbox,
          files: (fileNames.data || []).map((fileName) => ({ name: fileName })),
        };
      }
      return message;
    });

  const messages = await Promise.all(transformedMessagePromises);
  // filter out messages if a message is repeated by its parent-hash
  const uniqueMessages = messages.filter(
    (message, index, self) =>
      index === self.findIndex((t) => t.parentHash === message.parentHash),
  );
  return uniqueMessages;
};
