import {
  getFileNames,
  getLastMessagesFromInbox,
  getLastMessagesFromInboxWithBranches,
} from '@shinkai_network/shinkai-message-ts/api';
import type { ShinkaiMessage } from '@shinkai_network/shinkai-message-ts/models';
import {
  getMessageContent,
  getMessageFilesInbox,
  isLocalMessage,
} from '@shinkai_network/shinkai-message-ts/utils/shinkai_message_handler';

import { ChatConversationMessage } from '../getChatConversation/types';
import { CONVERSATION_PAGINATION_LIMIT } from '../getChatConversation/useGetChatConversationWithPagination';
import { GetChatConversationBranchesInput } from './types';

type ResponseItem = {
  hash: string;
  inboxId: string;
  content: string;
  sender: { avatar: string };
  isLocal: boolean;
  scheduledTime: string;
  parentHash?: string;
};

function flattenMessagesWithParentHash(
  messages: ResponseItem[][],
): ResponseItem[] {
  const flattenedMessages: ResponseItem[] = [];

  messages.forEach((messageGroup, index) => {
    messageGroup.forEach((message, subIndex) => {
      flattenedMessages.push(message);
    });
  });

  return flattenedMessages;
}

export const getChatConversationBranches = async ({
  nodeAddress,
  inboxId,
  count = CONVERSATION_PAGINATION_LIMIT,
  lastKey,
  shinkaiIdentity,
  profile,
  profile_encryption_sk,
  profile_identity_sk,
  node_encryption_pk,
}: GetChatConversationBranchesInput) => {
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

  console.log(
    '===>',
    data.map((x) =>
      x.map((y) => {
        const content = getMessageContent(y);
        return {
          content: content.split('20'),
        };
      }),
    ),
  );
  const flattenMessages: ShinkaiMessage[] = data.flat(1);

  const transformedMessagePromises: Promise<ChatConversationMessage>[] =
    flattenMessages.map(async (shinkaiMessage) => {
      const filesInbox = getMessageFilesInbox(shinkaiMessage);
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
  // filter out messages if a message is repeated by its hash
  const uniqueMessages = messages.filter(
    (message, index, self) =>
      index ===
      self.findIndex(
        (t) => t.hash === message.hash && t.parentHash === message.parentHash,
      ),
  );
  return uniqueMessages;
};
