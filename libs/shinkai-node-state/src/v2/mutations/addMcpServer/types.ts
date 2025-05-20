import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { McpServer, McpServerType } from '@shinkai_network/shinkai-message-ts/api/mcp-servers/types';

export type AddMcpServerInput = Token & {
  nodeAddress: string;
} & (
  | {
      name: string;
      type: McpServerType.Command;
      command: string;
      env: Record<string, string>;
      is_enabled: boolean;
    }
  | {
      name: string;
      type: McpServerType.Sse;
      url: string;
      is_enabled: boolean;
    }
);

export type AddMcpServerResponse = McpServer; 