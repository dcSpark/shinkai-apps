import { Agent } from '@shinkai_network/shinkai-message-ts/api/agents/types';
import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';

export type ImportAgentFromUrlInput = Token & {
  nodeAddress: string;
  url: string;
};

export type ImportAgentFromUrlOutput = Agent;
