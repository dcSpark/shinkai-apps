import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type GetInstalledNetworkToolsResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetInstalledNetworkToolsInput = Token & {
  nodeAddress: string;
};

export type GetInstalledNetworkToolsOutput = GetInstalledNetworkToolsResponse;
