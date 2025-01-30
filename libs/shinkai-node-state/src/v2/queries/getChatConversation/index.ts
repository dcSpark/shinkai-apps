import { ToolStatusType } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  downloadFile,
  getJobFolderName,
  getLastMessagesWithBranches,
} from '@shinkai_network/shinkai-message-ts/api/jobs/index';
import { ChatMessage } from '@shinkai_network/shinkai-message-ts/api/jobs/types';
import { getShinkaiFileProtocol } from '@shinkai_network/shinkai-message-ts/api/tools/index';
import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';

import {
  Artifact,
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
  folderName: string,
): Promise<UserMessage> => {
  const text = message.job_message.content;

  const hasFiles = (message.job_message?.job_filenames ?? [])?.length > 0;
  const attachments: UserMessage['attachments'] = [];

  if (hasFiles) {
    const fileNames = message.job_message.job_filenames ?? [];

    await Promise.all(
      fileNames?.map(async (name) => {
        const file: Attachment = {
          name,
          id: name,
          type: 'file',
        };

        if (name.match(/\.(jpg|jpeg|png|gif)$/i)) {
          try {
            const fileNameBase = name.split('/')?.at(-1) ?? 'untitled_tool';
            const fileExtension = fileNameBase.split('.')?.at(-1) ?? '';
            const base64String = await downloadFile(nodeAddress, token, {
              path: `${folderName}/${name}`,
            });
            if (base64String) {
              const byteCharacters = atob(base64String);
              const byteNumbers = new Array(byteCharacters.length)
                .fill(0)
                .map((_, i) => byteCharacters.charCodeAt(i));
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], {
                type: `image/${fileExtension}`,
              });
              file.type = 'image';
              file.preview = URL.createObjectURL(blob);
              file.size = blob.size;
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

const createAssistantMessage = async (
  message: ChatMessage,
  nodeAddress: string,
  token: string,
): Promise<AssistantMessage> => {
  const text = message.job_message.content;
  const toolCalls = await Promise.all(
    (message?.job_message?.metadata?.function_calls ?? []).map(async (tool) => {
      let generatedFiles:
        | {
            path: string;
            preview?: string; // image
            size?: number;
            content?: string; //md, markdown, txt, log
            blob?: Blob;
          }[]
        | undefined;

      if (tool.response) {
        try {
          const response = JSON.parse(tool.response);
          if ('data' in response && '__created_files__' in response.data) {
            const files: string[] = response.data.__created_files__;
            const fileResults = await Promise.all(
              files.map(async (file) => {
                try {
                  const response = await getShinkaiFileProtocol(
                    nodeAddress,
                    token,
                    { file: file.replace('/main', '') }, // todo: remove this once we fix it in the node
                  );

                  if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
                    const fileNameBase = file.split('/')?.at(-1) ?? 'untitled';
                    const fileExtension = fileNameBase.split('.')?.at(-1) ?? '';

                    const blob = new Blob([response], {
                      type: `image/${fileExtension}`,
                    });
                    const preview = URL.createObjectURL(blob);
                    return { path: file, preview, size: blob.size, blob };
                  }

                  if (file.match(/\.(md|markdown|txt|log)$/i)) {
                    const content = await response.text();
                    return {
                      path: file,
                      size: response.size,
                      content,
                      blob: response,
                    };
                  }

                  return { path: file, size: new Blob([response]).size };
                } catch (error) {
                  console.error(`Failed to fetch preview for ${file}:`, error);
                  return { path: file };
                }
              }),
            );
            generatedFiles = fileResults;
          }
        } catch {
          generatedFiles = undefined;
        }
      }

      return {
        toolRouterKey: tool.tool_router_key,
        name: tool.name,
        args: tool.arguments,
        status: ToolStatusType.Complete,
        result: tool?.response ?? '',
        generatedFiles,
      };
    }),
  );

  const artifacts: Artifact[] = [];

  const artifactRegex =
    /<antartifact\s+identifier="([^"]+)"\s+type="([^"]+)"\s+(?:language="([^"]+)"\s+)?title="([^"]+)">([\s\S]*?)<\/antartifact>/g;

  let match;
  while ((match = artifactRegex.exec(text)) !== null) {
    // const identifier = match[1];
    const type = match[2];
    const language = match[3];
    const title = match[4];
    let code = match[5];
    const codeRegex = /```(?:\w+)?\s*([\s\S]*?)\s*```/;
    if (codeRegex.test(code)) {
      code = code.match(/```(?:\w+)?\s*([\s\S]*?)\s*```/)?.[1] ?? '';
    }

    artifacts.push({
      identifier: message.node_api_data.node_message_hash,
      type,
      language,
      title,
      code,
    });
  }

  return {
    messageId: message.node_api_data.node_message_hash,
    createdAt: message.node_api_data.node_timestamp,
    metadata: {
      parentMessageId: message.node_api_data.parent_hash,
      inboxId: message.inbox,
      tps: message.job_message.metadata?.tps,
    },
    content: text.replace(/<antartifact[^>]*>[\s\S]*?<\/antartifact>/g, ''),
    role: 'assistant',
    status: {
      type: 'complete',
      reason: 'unknown',
    },
    toolCalls,
    artifacts,
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

  const { folder_name: folderName } = await getJobFolderName(
    nodeAddress,
    token,
    {
      job_id: extractJobIdFromInbox(inboxId),
    },
  );

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
      const userMessage = await createUserMessage(
        message,
        nodeAddress,
        token,
        folderName,
      );
      messagesV2.push(userMessage);
    } else {
      const assistantMessage = await createAssistantMessage(
        message,
        nodeAddress,
        token,
      );
      messagesV2.push(assistantMessage);
    }
  }

  return messagesV2;
};
