import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { McpServer, McpServerType } from '@shinkai_network/shinkai-message-ts/api/mcp-servers/types';
import { UpdateMcpServerRequest } from '@shinkai_network/shinkai-message-ts/api/mcp-servers/types';

export type UpdateMcpServerInput = Token & {
  nodeAddress: string;
} & UpdateMcpServerRequest;

export type UpdateMcpServerResponse = McpServer;
