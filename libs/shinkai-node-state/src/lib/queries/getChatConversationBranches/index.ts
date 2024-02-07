import {
  getFileNames,
  getLastMessagesFromInboxWithBranches,
} from '@shinkai_network/shinkai-message-ts/api';
import type { ShinkaiMessage } from '@shinkai_network/shinkai-message-ts/models';
import {
  calculateMessageHash,
  getMessageContent,
  getMessageFilesInbox,
  isLocalMessage,
} from '@shinkai_network/shinkai-message-ts/utils';

import {
  ChatConversationBranchesMessage,
  GetChatConversationBranchesInput,
  GetChatConversationBranchesOutput,
} from './types';
import { CONVERSATION_PAGINATION_LIMIT } from './useGetChatConversationBranchesWithPagination';

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
}: GetChatConversationBranchesInput): Promise<GetChatConversationBranchesOutput> => {
  const data: ShinkaiMessage[] = await getLastMessagesFromInboxWithBranches(
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

  const transformedMessagePromises: Promise<ChatConversationBranchesMessage>[] =
    data
      .flatMap((subArray) => subArray)
      .map(async (shinkaiMessage) => {
        const filesInbox = getMessageFilesInbox(shinkaiMessage);
        const content = getMessageContent(shinkaiMessage);
        const isLocal = isLocalMessage(
          shinkaiMessage,
          shinkaiIdentity,
          profile,
        );
        const message: ChatConversationBranchesMessage = {
          hash: calculateMessageHash(shinkaiMessage),
          inboxId,
          content,
          sender: {
            avatar: isLocal
              ? 'https://ui-avatars.com/api/?name=Me&background=313336&color=b0b0b0'
              : 'https://ui-avatars.com/api/?name=S&background=FF7E7F&color=ffffff',
          },
          isLocal,
          scheduledTime: shinkaiMessage.external_metadata?.scheduled_time,
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
            files: (fileNames.data || []).map((fileName) => ({
              name: fileName,
            })),
          };
        }
        return message;
      });
  return Promise.all(transformedMessagePromises);
};
