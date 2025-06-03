import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type GetToolResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetToolInput = Token & {
  nodeAddress: string;
  toolKey: string;
};

export type GetToolOutput = GetToolResponse;
