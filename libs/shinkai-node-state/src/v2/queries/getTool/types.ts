import { GetToolResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetToolInput = {
  nodeAddress: string;
  toolKey: string;
};

export type GetToolOutput = GetToolResponse;
