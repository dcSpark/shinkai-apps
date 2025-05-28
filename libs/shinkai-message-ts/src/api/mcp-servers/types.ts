import { McpServerTool } from "../tools/types";

export enum McpServerType {
  Command = 'Command',
  Sse = 'Sse',
}

export type McpServer =
  | {
      id: number;
      created_at: string;
      updated_at: string;
      name: string;
      type: McpServerType.Command;
      env: Record<string, string>;
      command: string;
      is_enabled: boolean;
    }
  | {
      id: number;
      created_at: string;
      updated_at: string;
      name: string;
      type: McpServerType.Sse;
      url: string;
      is_enabled: boolean;
    };

export type GetMcpServersResponse = McpServer[];

export type GetMcpServerToolsRequest = {
  id: number;
};
export type GetMcpServerToolsResponse = McpServerTool[];

export type AddMcpServerRequest =
  | {
      name: string;
      type: McpServerType.Command;
      env: Record<string, string>;
      command: string;
    }
  | {
      name: string;
      type: McpServerType.Sse;
      url: string;
    };

export type UpdateMcpServerRequest = {
  id: number;
  name?: string;
  is_enabled?: boolean;
  env?: Record<string, string>;
} & (
    {
      type: McpServerType.Command;
      command: string;
    }
  | {
      type: McpServerType.Sse;
      url: string;
    }
);

export type DeleteMcpServerRequest = {
  id: number;
};

export type ImportMcpServerFromGithubUrlRequest = {
  url: string;
};
