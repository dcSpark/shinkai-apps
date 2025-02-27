import { JobMessage } from '../jobs/types';

export type ShinkaiToolHeader = {
  author: string;
  config?: ToolConfig[];
  description: string;
  enabled: boolean;
  formatted_tool_summary_for_ui: string;
  name: string;
  tool_router_key: string;
  tool_type: ShinkaiToolType;
  version: string;
  input_args: {
    properties: Record<string, { description: string; type: string }>;
  };
};

export type ToolConfig = {
  BasicConfig: {
    description: string;
    key_name: string;
    key_value: string | null;
    required: boolean;
    type: string | null;
  };
};

export type ToolArgument = {
  name: string;
  arg_type: string;
  description: string;
  is_required: boolean;
};

type Embedding = {
  id: string;
  vector: number[];
};

type JSToolResult = {
  result_type: string;
  properties: Record<string, string>;
  required: string[];
};

export type OAuth = {
  name: string;
  authorizationUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  version: '1.0' | '2.0';
  responseType: 'code';
  scopes: string[];
  pkceType: 'plain' | undefined;
  refreshToken: 'false' | 'true' | undefined;
};

export type DenoShinkaiTool = {
  toolkit_name: string;
  tool_router_key?: string;
  name: string;
  author: string;
  js_code: string;
  config: ToolConfig[];
  description: string;
  keywords: string[];
  oauth: OAuth[];
  input_args: ToolArgument[];
  config_set: boolean;
  activated: boolean;
  embedding?: Embedding;
  result: Record<string, any>;
};
export type PythonShinkaiTool = {
  activated: boolean;
  author: string;
  keywords: string[];
  input_args: ToolArgument[];
  description: string;
  config: ToolConfig[];
  name: string;
  oauth: OAuth[];
  py_code: string;
  output_arg: {
    json: string;
  };
  result: JSToolResult;
};
export type RustShinkaiTool = {
  description: string;
  input_args: ToolArgument[];
  name: string;
  output_arg: {
    json: string;
  };
  tool_embedding?: Embedding;
  tool_router_key: string;
};

export type NetworkShinkaiTool = {
  activated: boolean;
  config: ToolConfig[];
  description: string;
  embedding: null | string;
  input_args: ToolArgument[];
  name: string;
  output_arg: {
    json: string;
  };
  provider: string;
  restrictions?: string;
  toolkit_name: string;
  usage_type: ToolUsageType;
  version: string;
};

export type ShinkaiToolType = 'Deno' | 'Python' | 'Rust' | 'Network';
export type ShinkaiTool =
  | DenoShinkaiTool
  | PythonShinkaiTool
  | RustShinkaiTool
  | NetworkShinkaiTool;

export type GetToolResponse = {
  content: [ShinkaiTool, boolean];
  type: ShinkaiToolType;
};

export type GetToolsCategory = 'downloaded' | 'default' | 'system' | 'my_tools';
export type GetToolsRequest = {
  category?: GetToolsCategory;
};
export type GetToolsResponse = ShinkaiToolHeader[];
export type GetToolsSearchResponse = [ShinkaiToolHeader, number][];

export type AddToolRequest = {
  type: ShinkaiToolType;
  content: [ShinkaiTool, boolean];
};

export type UpdateToolRequest = {
  type: ShinkaiToolType;
  content: [ShinkaiTool, boolean];
};
export type UpdateToolResponse = {
  type: ShinkaiToolType;
  content: [ShinkaiTool, boolean];
};

export type ToggleEnableToolRequest = {
  tool_router_key: string;
  enabled: boolean;
};

export type ToggleEnableToolResponse = {
  message: string;
  status: string;
};

// TODO: fix types after backend is ready

export type ToolPrice =
  | 'Free'
  | { DirectDelegation: string }
  | {
      Payment: Array<{
        amount: string;
        asset: {
          asset_id: string;
          contract_address: string;
          decimals: number;
          network_id: string;
        };
      }>;
    };

export type ToolUsageType = {
  PerUse: ToolPrice;
  Downloadable: ToolPrice;
};
export type PaymentTool = {
  toolKey: string;
  description: string;
  usageType: ToolUsageType;
};

export type PayInvoiceRequest = {
  invoice_id: string;
  data_for_tool: any;
};

export type PayInvoiceResponse = any;

export type Prompt = {
  rowid: number;
  name: string;
  prompt: string;
  is_system: boolean;
  is_enabled: boolean;
  version: string;
  is_favorite: boolean;
  useTools?: boolean; // flag for prompt templates
};
export type CreatePrompt = Omit<Prompt, 'rowid'>;

export type GetAllPromptsResponse = Prompt[];
export type SearchPromptsResponse = Prompt[];
export type CreatePromptRequest = CreatePrompt;
export type CreatePromptResponse = Prompt;
export type UpdatePromptRequest = Prompt;
export type DeletePromptRequest = {
  prompt_name: string;
};

export enum CodeLanguage {
  Typescript = 'Typescript',
  Python = 'Python',
}

export type CreateToolCodeRequest = {
  message: JobMessage;
  language: CodeLanguage;
  raw?: boolean;
  tools: string[];
};

export type CreateToolCodeResponse = {
  message_id: string;
  parent_message_id?: string;
  inbox: string;
  scheduled_time: string;
};

export type CreateToolMetadataRequest = {
  language: CodeLanguage;
  job_id: string;
  tools: string[];
};

export type CreateToolMetadataResponse = {
  job_id: string;
};

export enum DynamicToolType {
  DenoDynamic = 'denodynamic',
  PythonDynamic = 'pythondynamic',
}

export type ExecuteToolCodeRequest = {
  tool_type: DynamicToolType;
  parameters: Record<string, any>;
  code: string;
  extra_config?: Record<string, any>;
  llm_provider: string;
  tools: string[];
};

export type ExecuteToolCodeResponse = Record<string, any>;

export type SaveToolCodeRequest = {
  tool_router_key?: string;
  metadata: Record<string, any>;
  job_id: string;
  job_id_history?: string[];
  code: string;
  language: CodeLanguage;
  assets: string[];
};

export type ToolMetadata = {
  name: string;
  description: string;
  author: string;
  keywords: string[];
  version?: string;
  configurations: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
  result: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
  tools: string[];
};

export type SaveToolCodeResponse = {
  shinkai_tool: {
    type: 'Deno';
    content: [ShinkaiTool, boolean];
  };
  metadata: {
    metadata: ToolMetadata;
    tool_router_key: string;
    job_id: string;
    code: string;
  };
};

export type PlaygroundTool = {
  metadata: ToolMetadata;
  tool_router_key: string;
  job_id: string;
  job_id_history: string[];
  code: string;
  language: string;
};
export type GetPlaygroundToolsResponse = PlaygroundTool[];
export type GetPlaygroundToolRequest = { tool_key: string };
export type GetPlaygroundToolResponse = PlaygroundTool;
export type UndoToolImplementationRequest = {
  message_hash: string;
  job_id: string;
};
export type UndoToolImplementationResponse = {
  message: string;
  status: string;
};
export type UpdateToolCodeImplementationRequest = {
  code: string;
  job_id: string;
};
export type UpdateToolCodeImplementationResponse = {
  message: string;
  status: string;
};
export type OpenToolInCodeEditorRequest = {
  code: string;
  language: CodeLanguage;
  config: Record<string, any>;
  parameters: Record<string, any>;
  oauth: OAuth[];
  tools: string[];
  metadata: ToolMetadata;
};
export type OpenToolInCodeEditorResponse = {
  message: string;
  status: 'success' | 'error';
  files: Record<string, string>;
  playground_path: string;
};
export type DuplicateToolRequest = {
  tool_key_path: string;
};
export type DuplicateToolResponse = {
  job_id: string;
  tool_router_key: string;
  version: string;
};
export type RemovePlaygroundToolRequest = {
  tool_key: string;
};

export type RemoveToolRequest = {
  tool_key: string;
};

export type ImportToolRequest = {
  url: string;
};

export type ImportToolResponse = {
  message: string;
  status: string;
  tool: GetToolResponse;
  tool_key: string;
};

export type ExportToolRequest = {
  toolKey: string;
};

export type ExportToolResponse = Blob;
export type GetShinkaiFileProtocolRequest = { file: string };
export type GetShinkaiFileProtocolResponse = Blob;

export type GetAllToolAssetsResponse = string[];
export type AddToolRequestRequest = {
  filename: string;
  file: File;
};
export type AddToolRequestResponse = {
  file: number;
  file_name: string;
  message: string;
  status: string;
};
export type RemoveToolRequestRequest = {
  filename: string;
};
export type SetOAuthTokenRequest = {
  code: string;
  state: string;
};

export type SetOAuthTokenResponse = {
  message: string;
  status: string;
};
export type EnableAllToolsResponse = {
  [toolKey: string]: {
    activated: boolean;
  };
};
export type DisableAllToolsResponse = {
  [toolKey: string]: {
    activated: boolean;
  };
};

export type PublishToolRequest = {
  tool_key_path: string;
};
export type PublishToolResponse = {
  message: string;
  response: {
    message: string;
    revisionId: string;
  };
  status: string;
  tool_key: string;
};

export type GetToolStoreDetailsRequest = {
  tool_router_key: string;
};
export type GetToolStoreDetailsResponse = {
  assets: {
    bannerUrl: string;
    iconUrl: string;
  };
  product: {
    product: {
      author: string;
      banner_url: string;
      categoryId: string;
      createdAt: string;
      description: string;
      downloads: number;
      featured: boolean;
      icon_url: string;
      id: string;
      isActive: boolean;
      keywords: string[];
      name: string;
      operating_system: string[];
      price_usd: number;
      routerKey: string;
      runner: string;
      stripeProductId: string;
      toolLanguage: string;
      tool_set: string;
      type: string;
      category: {
        id: string;
        name: string;
        description: string;
        examples: string;
      };
    };
    versions: {
      file: string;
      hash: string;
      id: string;
      node_version: string;
      version: string;
    }[];
  };
};
