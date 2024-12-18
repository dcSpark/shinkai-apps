import {
  Token,
  ToolArgs,
  ToolStatusType,
} from '@shinkai_network/shinkai-message-ts/api/general/types';
import { InfiniteData } from '@tanstack/react-query';
import { ReactNode } from 'react';

export type GetChatConversationInput = Token & {
  nodeAddress: string;
  inboxId: string;
  count?: number;
  lastKey?: string;
  shinkaiIdentity: string;
  profile: string;
  enabled?: boolean;
  refetchIntervalEnabled?: boolean;
};

export type Artifact = {
  identifier: string;
  type: string;
  title: string;
  code: string;
  language?: string;
};

type ToolCall = {
  toolRouterKey: string;
  name: string;
  args: ToolArgs;
  result?: string;
  status?: ToolStatusType; // TODO: remove
  isError?: boolean;
};

export type Attachment = {
  id: string;
  type: 'image' | 'document' | 'file';
  name: string;
  file?: File;
  preview?: string;
};

export type MessageStatus =
  | {
      type: 'running';
    }
  | {
      type: 'requires-action';
      reason: 'tool-calls';
    }
  | {
      type: 'complete';
      reason: 'stop' | 'unknown';
    }
  | {
      type: 'incomplete';
      reason:
        | 'cancelled'
        | 'tool-calls'
        | 'length'
        | 'content-filter'
        | 'other'
        | 'error';
      error?: unknown;
    };

type BaseMessage = {
  messageId: string;
  createdAt: string;
  metadata: {
    parentMessageId: string;
    inboxId: string;
    tps?: string;
  };
};
export type TextContentPart = { type: 'text'; text: string };
export type ToolCallContentPart = { type: 'tool-call'; toolCalls: ToolCall[] };
export type UIContentPart = { type: 'ui'; display: ReactNode };

export type UserContentPart = string | TextContentPart | UIContentPart;

export type AssistantContentPart =
  | string
  | TextContentPart
  | ToolCallContentPart
  | UIContentPart;

export type UserMessage = BaseMessage & {
  role: 'user';
  content: string; // UserContentPart
  attachments: Attachment[];
  workflowName?: string;
};

export type AssistantMessage = BaseMessage & {
  role: 'assistant';
  content: string; // AssistantContentPart
  status: MessageStatus;
  toolCalls: ToolCall[];
  artifacts: Artifact[];
};

export type FormattedMessage = AssistantMessage | UserMessage;

export type GetChatConversationOutput = FormattedMessage[];

export type ChatConversationInfiniteData =
  InfiniteData<GetChatConversationOutput> & {
    content: FormattedMessage[];
  };
