import { getLastMessages } from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { GetChatConversationInput, GetChatConversationOutput } from './types';
import { CONVERSATION_PAGINATION_LIMIT } from './useGetChatConversationWithPagination';

export const getChatConversation = async ({
  nodeAddress,
  token,
  inboxId,
  count = CONVERSATION_PAGINATION_LIMIT,
  lastKey,
  shinkaiIdentity,
  profile,
}: GetChatConversationInput) => {
  const data = await getLastMessages(nodeAddress, token, {
    inbox_name: inboxId,
    limit: count,
    offset_key: lastKey,
  });

  return data.map((message) => {
    const isLocal =
      message.sender === shinkaiIdentity &&
      message.sender_subidentity === profile;

    return {
      hash: message.node_api_data.node_message_hash,
      parentHash: message.node_api_data.parent_hash,
      inboxId: message.inbox,
      scheduledTime: message.node_api_data.node_timestamp,
      content: message.job_message.content,
      workflowName: message.job_message.workflow_name,
      isLocal,
      sender: {
        avatar: isLocal
          ? 'https://ui-avatars.com/api/?name=Me&background=313336&color=b0b0b0'
          : 'https://ui-avatars.com/api/?name=S&background=FF7E7F&color=ffffff',
      },
    };
  });
};
