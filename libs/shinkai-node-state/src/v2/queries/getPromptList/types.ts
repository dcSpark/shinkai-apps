import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type GetAllPromptsResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetPromptListInput = Token & {
  nodeAddress: string;
};

export type GetPromptListOutput = GetAllPromptsResponse;
