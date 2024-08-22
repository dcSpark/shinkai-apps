import { ShinkaiToolType } from '../../models/SchemaTypes';

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
