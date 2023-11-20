/* eslint-disable no-unused-vars */

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export enum FunctionKey {
  GET_AGENTS = "GET_AGENTS",
  GET_INBOXES = "GET_INBOXES",
  GET_CHAT_CONVERSATION = "GET_CHAT_CONVERSATION",
  GET_CHAT_CONVERSATION_PAGINATION = "GET_CHAT_CONVERSATION_PAGINATION",
}
