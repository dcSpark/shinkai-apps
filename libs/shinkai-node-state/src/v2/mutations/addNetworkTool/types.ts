import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type NetworkShinkaiTool } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type AddNetworkToolInput = Token & {
  nodeAddress: string;
  networkTool: NetworkShinkaiTool;
};
export type AddNetworkToolOutput = any;
