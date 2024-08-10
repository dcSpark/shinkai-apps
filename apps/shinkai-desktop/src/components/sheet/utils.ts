import {
  ColumnBehavior,
  ColumnType,
  Workflow,
} from '@shinkai_network/shinkai-message-ts/models/SchemaTypes';

export const getFormula = (columnBehavior?: ColumnBehavior): string => {
  if (
    typeof columnBehavior === 'object' &&
    ColumnType.Formula in columnBehavior
  ) {
    return Object.values(columnBehavior)[0] as string;
  }
  return '';
};

export const getColumnBehaviorName = (
  columnBehavior?: ColumnBehavior,
): ColumnType => {
  if (typeof columnBehavior === 'string') {
    return columnBehavior;
  }
  if (typeof columnBehavior === 'object') {
    return Object.keys(columnBehavior)[0] as ColumnType;
  }
  return ColumnType.Text;
};

export const getPromptInput = (columnBehavior?: ColumnBehavior): string => {
  if (
    typeof columnBehavior === 'object' &&
    ColumnType.LLMCall in columnBehavior
  ) {
    return Object.values(columnBehavior)[0].input as string;
  }
  return '';
};

export const getAgentId = (columnBehavior?: ColumnBehavior): string => {
  if (
    typeof columnBehavior === 'object' &&
    ColumnType.LLMCall in columnBehavior
  ) {
    return Object.values(columnBehavior)[0].llm_provider_name as string;
  }
  return '';
};

export const getWorkflow = (
  columnBehavior?: ColumnBehavior,
): Workflow | undefined => {
  if (
    typeof columnBehavior === 'object' &&
    ColumnType.LLMCall in columnBehavior
  ) {
    return Object.values(columnBehavior)[0].workflow as Workflow;
  }
  return undefined;
};
