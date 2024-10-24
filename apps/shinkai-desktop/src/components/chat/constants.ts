import { Models } from '@shinkai_network/shinkai-node-state/lib/utils/models';
import {
  AssistantMessage,
  Attachment,
  UserMessage,
} from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/types';

export const streamingSupportedModels = [
  Models.Ollama,
  Models.Exo,
  Models.Gemini,
  Models.OpenRouter,
];

export const OPTIMISTIC_USER_MESSAGE_ID = 'OPTIMISTIC_USER_MESSAGE_ID';
export const OPTIMISTIC_ASSISTANT_MESSAGE_ID =
  'OPTIMISTIC_ASSISTANT_MESSAGE_ID';

export const generateOptimisticUserMessage = (
  content: string,
  attachments?: Attachment[],
  workflowName?: string,
): UserMessage => ({
  messageId: OPTIMISTIC_USER_MESSAGE_ID,
  createdAt: new Date().toISOString(),
  content: content,
  role: 'user',
  metadata: { parentMessageId: '', inboxId: '' },
  attachments: attachments ?? [],
  workflowName: workflowName,
});

export const generateOptimisticAssistantMessage = (): AssistantMessage => ({
  messageId: OPTIMISTIC_ASSISTANT_MESSAGE_ID,
  createdAt: new Date().toISOString(),
  content: '',
  role: 'assistant',
  status: { type: 'running' },
  metadata: { parentMessageId: '', inboxId: '' },
  toolCalls: [],
});
