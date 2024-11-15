import { JobConfig } from '../jobs/types';

export type Agent = {
  name: string;
  agent_id: string;
  full_identity_name: string;
  llm_provider_id: string;
  ui_description: string;
  knowledge: string[];
  storage_path: string;
  tools: string[];
  debug_mode: boolean;
  config?: JobConfig | null;
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
