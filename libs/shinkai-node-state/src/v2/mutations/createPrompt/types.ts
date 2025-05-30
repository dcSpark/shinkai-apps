import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type CreatePromptResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type CreatePromptOutput = CreatePromptResponse;

export type CreatePromptInput = Token & {
  nodeAddress: string;
  promptName: string;
  promptContent: string;
};
