import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { SearchPromptsResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetPromptSearchInput = Token & {
  nodeAddress: string;
  search: string;
};

export type GetPromptSearchOutput = SearchPromptsResponse;
