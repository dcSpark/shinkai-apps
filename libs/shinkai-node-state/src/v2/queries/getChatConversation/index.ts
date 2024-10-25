import {
  downloadFileFromInbox,
  getFileNames,
  getLastMessagesWithBranches,
} from '@shinkai_network/shinkai-message-ts/api/jobs/index';
import { ChatMessage } from '@shinkai_network/shinkai-message-ts/api/jobs/types';

import {
  AssistantMessage,
  Attachment,
  FormattedMessage,
  GetChatConversationInput,
  GetChatConversationOutput,
  UserMessage,
} from './types';
import { CONVERSATION_PAGINATION_LIMIT } from './useGetChatConversationWithPagination';

const createUserMessage = async (
  message: ChatMessage,
  nodeAddress: string,
  token: string,
): Promise<UserMessage> => {
  const text = message.job_message.content;

  const inbox = message.job_message?.files_inbox;
  const attachments: UserMessage['attachments'] = [];

  if (inbox) {
    const fileNames = await getFileNames(nodeAddress, token, {
      inboxName: inbox,
    });

    await Promise.all(
      fileNames?.map(async (name) => {
        const file: Attachment = {
          name,
          id: name,
          type: 'file',
        };

        if (name.match(/\.(jpg|jpeg|png|gif)$/i)) {
          try {
            const response = await downloadFileFromInbox(
              nodeAddress,
              token,
              inbox,
              name,
            );
            if (response) {
              const blob = new Blob([response]);
              file.type = 'image';
              file.preview = URL.createObjectURL(blob);
            }
          } catch (error) {
            console.error(error);
            throw new Error(`Failed to download file - ${name}`);
          }
        }

        attachments.push(file);
      }),
    );
  }

  return {
    messageId: message.node_api_data.node_message_hash,
    createdAt: message.node_api_data.node_timestamp,
    metadata: {
      parentMessageId: message.node_api_data.parent_hash,
      inboxId: message.inbox,
    },
    role: 'user',
    content: text,
    attachments,
  };
};

const createAssistantMessage = (message: ChatMessage): AssistantMessage => {
  const text = message.job_message.content;

  const toolCalls = (message?.job_message?.metadata?.function_calls ?? []).map(
    (tool) => ({
      toolRouterKey: tool.tool_router_key,
      name: tool.name,
      args: tool.arguments,
    }),
  );

  return {
    messageId: message.node_api_data.node_message_hash,
    createdAt: message.node_api_data.node_timestamp,
    metadata: {
      parentMessageId: message.node_api_data.parent_hash,
      inboxId: message.inbox,
    },
    content: text,
    role: 'assistant',
    status: {
      type: 'complete',
      reason: 'unknown',
    },
    toolCalls,
  };
};

export const getChatConversation = async ({
  nodeAddress,
  token,
  inboxId,
  count = CONVERSATION_PAGINATION_LIMIT,
  lastKey,
  shinkaiIdentity,
  profile,
}: GetChatConversationInput): Promise<GetChatConversationOutput> => {
  const data = await getLastMessagesWithBranches(nodeAddress, token, {
    inbox_name: inboxId,
    limit: count,
    offset_key: lastKey,
  });

  const flattenMessages = data.flat(1);

  const uniqueParentHashes = new Set<string>();
  const uniqueMessages = flattenMessages.filter((message) => {
    if (uniqueParentHashes.has(message.node_api_data.parent_hash)) {
      return false;
    }
    uniqueParentHashes.add(message.node_api_data.parent_hash);
    return true;
  });

  const messagesV2: FormattedMessage[] = [];

  for (const message of uniqueMessages) {
    const role: 'user' | 'assistant' =
      message.sender === shinkaiIdentity &&
      message.sender_subidentity === profile
        ? 'user'
        : 'assistant';

    if (role === 'user') {
      const userMessage = await createUserMessage(message, nodeAddress, token);
      messagesV2.push(userMessage);
    } else {
      const assistantMessage = createAssistantMessage(message);
      messagesV2.push(assistantMessage);
    }
  }

  return messagesV2;
};
