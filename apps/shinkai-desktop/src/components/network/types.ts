import { type NetworkToolWithOffering } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type ApiPayment = {
  maxAmountRequired?: string;
  extra?: {
    name?: string;
    version?: string;
  };
  asset?: string;
  description?: string;
  maxTimeoutSeconds?: number;
  mimeType?: string;
  network?: string;
  outputSchema?: Record<string, any>;
  payTo?: string;
  resource?: string;
  scheme?: string;
};

export type ApiUsageType = {
  PerUse?: {
    Payment?: ApiPayment[];
  };
};

export type ApiNetworkTool = {
  activated?: boolean;
  author: string;
  config?: Record<string, any>[];
  description?: string;
  input_args?: Record<string, any>;
  mcp_enabled?: boolean;
  name?: string;
  output_arg: {
    json: string;
  };
  restrictions?: string;
  provider?: string;
  tool_router_key?: string;
  usage_type?: ApiUsageType;
  version?: string;
};

export type ApiToolOffering = {
  meta_description?: string;
  usage_type?: ApiUsageType;
};

export type ApiNetworkAgent = {
  network_tool?: ApiNetworkTool;
  tool_offering?: ApiToolOffering;
};

export type FormattedNetworkAgent = {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  provider: string;
  toolRouterKey: string;
  apiData: NetworkToolWithOffering;
};
