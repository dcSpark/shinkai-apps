import {
  Token,
  ToolArgs,
  ToolStatusType,
} from '@shinkai_network/shinkai-message-ts/api/general/types';
import { InfiniteData } from '@tanstack/react-query';

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

type ToolCall = {
  toolRouterKey: string;
  name: string;
  args: ToolArgs;
  result?: unknown;
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
  };
};
export type UserMessage = BaseMessage & {
  role: 'user';
  content: string;
  attachments: Attachment[];
  workflowName?: string;
};

export type AssistantMessage = BaseMessage & {
  role: 'assistant';
  content: string;
  status: MessageStatus;
  toolCalls: ToolCall[];
};

export type FormattedMessage = AssistantMessage | UserMessage;

export type GetChatConversationOutput = FormattedMessage[];

export type ChatConversationInfiniteData =
  InfiniteData<GetChatConversationOutput> & {
    content: FormattedMessage[];
  };
