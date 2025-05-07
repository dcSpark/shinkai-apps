import { JobConfig } from '../jobs/types';
import { RecurringTask } from '../recurring-tasks/types';

export type Agent = {
  name: string;
  agent_id: string;
  full_identity_name: string;
  llm_provider_id: string;
  ui_description: string;
  knowledge: string[];
  storage_path: string;
  tools: string[];
  tools_config_override: Record<string, Record<string, any>>;
  debug_mode: boolean;
  config?: JobConfig | null;
  scope?: {
    vector_fs_items: string[];
    vector_fs_folders: string[];
    vector_search_mode: string;
  };
  cron_tasks?: RecurringTask[];
};

export type CreateAgentRequest = Agent;
export type CreateAgentResponse = Agent;
export type RemoveAgentRequest = {
  agent_id: string;
};
export type RemoveAgentResponse = string;
export type UpdateAgentRequest = Agent;
export type UpdateAgentResponse = Agent;
export type GetAgentRequest = {
  agentId: string;
};
export type GetAgentResponse = Agent;

export type GetAgentsResponse = Agent[];

export type ExportAgentRequest = {
  agent_id: string;
};

export type ExportAgentResponse = Blob;

export type ImportAgentRequest = {
  file: File;
};

export type ImportAgentResponse = Agent;

export type GenerateAgentFromPromptRequest = {
  llm_provider: string;
  prompt: string;
};

export type GeneratedAgent = {
  indications: string;
  instructions: string;
  name: string;
  tools: Array<{
    description: string;
    name: string;
  }>;
};

export type GenerateAgentFromPromptResponse = {
  result: GeneratedAgent;
};
