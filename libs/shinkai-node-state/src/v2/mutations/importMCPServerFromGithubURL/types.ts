import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { McpServer } from '@shinkai_network/shinkai-message-ts/api/mcp-servers/types';

export type ImportMCPServerFromGithubURLInput = Token & {
  nodeAddress: string;
  githubUrl: string
};

export type ImportMCPServerFromGithubURLOutput = McpServer;