import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { EnableAllToolsResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type EnableAllToolsInput = Token & {
  nodeAddress: string;
};

export type EnableAllToolsOutput = EnableAllToolsResponse;
