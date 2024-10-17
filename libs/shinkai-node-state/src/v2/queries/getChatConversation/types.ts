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

type TextContentPart = { type: 'text'; text: string };
type FileContentPart = { type: 'file'; fileName: string; filePreview?: string };
type WorkflowContentPart = { type: 'workflow'; workflowName: string };
type ToolCallContentPart = {
  type: 'tool-call';
  toolRouterKey: string;
  toolName: string;
  args: ToolArgs;
  result?: unknown;
  isError?: boolean;
};
type UserMessageContentPart =
  | TextContentPart
  | FileContentPart
  | WorkflowContentPart;

type AssistantMessageContentPart = TextContentPart | ToolCallContentPart;

type UserMessage = {
  role: 'user';
  content: UserMessageContentPart[];
};
type AssistantMessage = {
  role: 'assistant';
  content: AssistantMessageContentPart[];
};
export type FormattedChatMessage = {
  hash: string;
  parentHash: string;
  inboxId: string;
  scheduledTime: string | undefined;
  content: string;
  workflowName: string | undefined;
  isLocal: boolean;
  sender: {
    avatar: string;
  };
  fileInbox?: {
    id: string;
    files: {
      name: string;
      preview?: string;
    }[];
  };
  toolCalls?: {
    name: string;
    args: ToolArgs;
    status: ToolStatusType;
    toolRouterKey: string;
  }[];
  //  message v2
  messageId: string;
  role: 'user' | 'assistant';
  contentV2: (
    | TextContentPart
    | FileContentPart
    | WorkflowContentPart
    | ToolCallContentPart
  )[];
  createdAt: string;
  metadata: {
    parentMessageId: string;
    inboxId: string;
  };
};

type Message = AssistantMessage | UserMessage;

export type GetChatConversationOutput = FormattedChatMessage[];

export type ChatConversationInfiniteData =
  InfiniteData<GetChatConversationOutput> & {
    content: FormattedChatMessage[];
  };
