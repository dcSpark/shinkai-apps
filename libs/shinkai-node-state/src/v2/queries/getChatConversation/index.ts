import { ToolStatusType } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  downloadFileFromInbox,
  getFileNames,
  getLastMessagesWithBranches,
} from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import {
  FormattedChatMessage,
  GetChatConversationInput,
  GetChatConversationOutput,
} from './types';
import { CONVERSATION_PAGINATION_LIMIT } from './useGetChatConversationWithPagination';

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

  const formattedMessagePromise = await Promise.all(
    flattenMessages.map(async (message) => {
      const isLocal =
        message.sender === shinkaiIdentity &&
        message.sender_subidentity === profile;

      const formattedMessage: FormattedChatMessage = {
        isLocal,
        hash: message.node_api_data?.node_message_hash,
        parentHash: message.node_api_data?.parent_hash,
        inboxId: message.inbox,
        scheduledTime: message.node_api_data?.node_timestamp,
        content: message.job_message?.content,
        workflowName: message.job_message?.workflow_name,
        sender: {
          avatar: isLocal
            ? 'https://ui-avatars.com/api/?name=Me&background=313336&color=b0b0b0'
            : 'https://ui-avatars.com/api/?name=S&background=FF7E7F&color=ffffff',
        },
        toolCalls: (message.job_message?.metadata?.function_calls ?? []).map(
          (tool) => ({
            name: tool.name,
            args: tool.arguments,
            status: ToolStatusType.Complete, //TODO: add from backend status
            toolRouterKey: tool.tool_router_key,
          }),
        ),
      };

      const inbox = message.job_message?.files_inbox;
      if (inbox) {
        const fileNames = await getFileNames(nodeAddress, token, {
          inboxName: inbox,
        });

        formattedMessage.fileInbox = {
          id: inbox,
          files: await Promise.all(
            fileNames?.map(async (name) => {
              const file: {
                name: string;
                preview?: string;
              } = { name };
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
                    file.preview = URL.createObjectURL(blob);
                  }
                } catch (error) {
                  console.error(error);
                  throw new Error(`Failed to download file - ${name}`);
                }
              }
              return file;
            }),
          ),
        };
      }

      return formattedMessage;
    }),
  );

  const messages = await Promise.all(formattedMessagePromise);
  // filter out messages if a message is repeated by its parent-hash
  const uniqueMessages = messages.filter(
    (message, index, self) =>
      index === self.findIndex((t) => t.parentHash === message.parentHash),
  );
  return uniqueMessages;
};
