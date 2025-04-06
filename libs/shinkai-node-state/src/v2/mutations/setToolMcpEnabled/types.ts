import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';

export type SetToolMcpEnabledOutput = {
  success: boolean;
};

export type SetToolMcpEnabledInput = Token & {
  nodeAddress: string;
  toolRouterKey: string;
  mcpEnabled: boolean;
};
