import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { GetMcpServersResponse } from '@shinkai_network/shinkai-message-ts/api/mcp-servers/types';

export type GetMcpServersInput = Token & {
  nodeAddress: string;
};

export type GetMcpServersOutput = GetMcpServersResponse;
