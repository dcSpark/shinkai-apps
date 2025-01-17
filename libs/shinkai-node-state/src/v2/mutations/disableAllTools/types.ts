import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { DisableAllToolsResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type DisableAllToolsInput = Token & {
  nodeAddress: string;
};

export type DisableAllToolsOutput = DisableAllToolsResponse;
