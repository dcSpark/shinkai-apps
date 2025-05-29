import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { McpServer } from '@shinkai_network/shinkai-message-ts/api/mcp-servers/types';

export type DeleteMcpServerInput = Token & {
  nodeAddress: string;
  id: number;
};

export type DeleteMcpServerResponse = McpServer; 