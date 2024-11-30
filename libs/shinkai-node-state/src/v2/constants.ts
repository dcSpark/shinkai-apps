import {
  AssistantMessage,
  Attachment,
  UserMessage,
} from './queries/getChatConversation/types';

export enum FunctionKeyV2 {
  GET_HEALTH = 'GET_HEALTH',
  GET_ENCRYPTION_KEYS = 'GET_ENCRYPTION_KEYS',
  GET_AGENT = 'GET_AGENT',
  GET_AGENTS = 'GET_AGENTS',
  GET_LLM_PROVIDERS = 'GET_LLM_PROVIDERS',
  GET_INBOXES = 'GET_INBOXES',
  GET_CHAT_CONVERSATION = 'GET_CHAT_CONVERSATION',
  GET_CHAT_CONVERSATION_PAGINATION = 'GET_CHAT_CONVERSATION_PAGINATION',
  GET_CHAT_CONVERSATION_BRANCHES = 'GET_CHAT_CONVERSATION_BRANCHES',
  GET_NODE_FILES = 'GET_NODE_FILES',
  GET_VR_FILES = 'GET_VR_FILES',
  GET_VR_FILES_SEARCH = 'GET_VR_FILES_SEARCH',
  GET_VR_SEARCH_SIMPLIFIED = 'GET_VR_SEARCH_SIMPLIFIED',
  GET_AVAILABLE_SHARED_ITEMS = 'GET_AVAILABLE_SHARED_ITEMS',
  GET_MY_SUBSCRIPTIONS = 'GET_MY_SUBSCRIPTIONS',
  GET_SUBSCRIPTION_NOTIFICATIONS = 'GET_SUBSCRIPTION_NOTIFICATIONS',
  GET_MY_SHARED_FOLDERS = 'GET_MY_SHARED_FOLDERS',
  SCAN_OLLAMA_MODELS = 'SCAN_OLLAMA_MODELS',
  GET_USER_SHEETS = 'GET_USER_SHEETS',
  GET_SHEET = 'GET_SHEET',
  GET_LIST_TOOLS = 'GET_LIST_TOOLS',
  GET_PLAYGROUND_TOOL = 'GET_PLAYGROUND_TOOL',
  GET_PLAYGROUND_TOOLS = 'GET_PLAYGROUND_TOOLS',
  GET_TOOL = 'GET_TOOL',
  GET_SEARCH_TOOLS = 'GET_SEARCH_TOOLS',
  GET_CHAT_CONFIG = 'GET_CHAT_CONFIG',
  GET_JOB_SCOPE = 'GET_JOB_SCOPE',
  GET_LIST_PROMPTS = 'GET_LIST_PROMPTS',
  GET_SEARCH_PROMPT = 'GET_SEARCH_PROMPT',
  GET_WALLET_LIST = 'GET_WALLET_LIST',
}

export const DEFAULT_CHAT_CONFIG = {
  temperature: 0.8,
  seed: -1,
  top_k: 40,
  top_p: 0.9,
  stream: true,
  use_tools: true,
} as const;

export const OPTIMISTIC_USER_MESSAGE_ID = 'OPTIMISTIC_USER_MESSAGE_ID';
export const OPTIMISTIC_ASSISTANT_MESSAGE_ID =
  'OPTIMISTIC_ASSISTANT_MESSAGE_ID';

export const generateOptimisticUserMessage = (
  content: string,
  attachments?: Attachment[],
): UserMessage => ({
  messageId: OPTIMISTIC_USER_MESSAGE_ID,
  createdAt: new Date().toISOString(),
  content: content,
  role: 'user',
  metadata: { parentMessageId: '', inboxId: '' },
  attachments: attachments ?? [],
});

export const generateOptimisticAssistantMessage = (): AssistantMessage => ({
  messageId: OPTIMISTIC_ASSISTANT_MESSAGE_ID,
  createdAt: new Date().toISOString(),
  content: '',
  role: 'assistant',
  status: { type: 'running' },
  metadata: { parentMessageId: '', inboxId: '' },
  toolCalls: [],
  artifacts: [],
});
