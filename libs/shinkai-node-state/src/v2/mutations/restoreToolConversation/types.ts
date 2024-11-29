import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { SaveToolCodeResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type RestoreToolConversationInput = Token & {
  nodeAddress: string;
  jobId: string;
  messageId: string;
};

export type RestoreToolConversationOutput = SaveToolCodeResponse;
