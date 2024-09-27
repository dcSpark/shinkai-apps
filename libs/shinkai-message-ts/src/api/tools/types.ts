export type WorkflowRaw = {
  name: string;
  version: string;
  steps?: [];
  raw: string;
  description?: string;
  author: string;
  sticky: boolean;
};
export type ShinkaiToolHeader = {
  author: string;
  config?: string;
  description: string;
  enabled: boolean;
  formatted_tool_summary_for_ui: string;
  name: string;
  tool_router_key: string;
  tool_type: ShinkaiToolType;
  version: string;
};

export type ListAllWorkflowsResponse = ShinkaiToolHeader[];
export type SearchWorkflowsResponse = ShinkaiToolHeader[];

export type ToolConfig = {
  BasicConfig: {
    description: string;
    key_name: string;
    key_value: string | null;
    required: boolean;
  };
};
export type WorkflowShinkaiTool = {
  workflow: WorkflowRaw;
  embedding: Embedding[];
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
export type JSShinkaiTool = {
  toolkit_name: string;
  name: string;
  author: string;
  js_code: string;
  config: ToolConfig[];
  description: string;
  keywords: string[];
  input_args: ToolArgument[];
  config_set: boolean;
  activated: boolean;
  embedding?: Embedding;
  result: JSToolResult;
};
export type ShinkaiToolType = 'JS' | 'Workflow';
export type ShinkaiTool = WorkflowShinkaiTool | JSShinkaiTool;

export type GetToolResponse = {
  content: [ShinkaiTool, boolean];
  type: ShinkaiToolType;
};
export type GetToolsResponse = ShinkaiToolHeader[];

export type AddWorkflowRequest = {
  workflow_raw: string;
  description: string;
};
export type AddWorkflowResponse = {
  status: string;
  message: string;
};
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
  name: string;
  prompt: string;
  is_system: boolean;
  is_enabled: boolean;
  version: string;
  is_favorite: boolean;
  embedding?: string;
};
export type GetAllPromptsResponse = Prompt[];
export type SearchPromptsResponse = Prompt[];
export type CreatePromptRequest = Prompt;
export type CreatePromptResponse = Prompt;
export type UpdatePromptRequest = Prompt;
export type DeletePromptRequest = {
  prompt_name: string;
};
