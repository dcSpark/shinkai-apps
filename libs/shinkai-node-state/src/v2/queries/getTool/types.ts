import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { GetToolResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetToolInput = Token & {
  nodeAddress: string;
  toolKey: string;
};

export type GetToolOutput = GetToolResponse;
