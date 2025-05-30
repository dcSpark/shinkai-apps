import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type DisableAllToolsResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type DisableAllToolsInput = Token & {
  nodeAddress: string;
};

export type DisableAllToolsOutput = DisableAllToolsResponse;
