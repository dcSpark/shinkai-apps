import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export enum FunctionKey {
  GET_HEALTH = 'GET_HEALTH',
  GET_ENCRYPTION_KEYS = 'GET_ENCRYPTION_KEYS',
  GET_AGENTS = 'GET_AGENTS',
  GET_INBOXES = 'GET_INBOXES',
  GET_CHAT_CONVERSATION = 'GET_CHAT_CONVERSATION',
  GET_CHAT_CONVERSATION_PAGINATION = 'GET_CHAT_CONVERSATION_PAGINATION',
  GET_NODE_FILES = 'GET_NODE_FILES',
  GET_VR_FILES = 'GET_VR_FILES',
  GET_VR_FILES_SEARCH = 'GET_VR_FILES_SEARCH',
  GET_VR_SEARCH_SIMPLIFIED = 'GET_VR_SEARCH_SIMPLIFIED',
  GET_AVAILABLE_SHARED_ITEMS = 'GET_AVAILABLE_SHARED_ITEMS',
}
