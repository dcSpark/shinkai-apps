import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type UndoToolImplementationResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type RestoreToolConversationInput = Token & {
  nodeAddress: string;
  jobId: string;
  messageId: string;
};

export type RestoreToolConversationOutput = UndoToolImplementationResponse;
