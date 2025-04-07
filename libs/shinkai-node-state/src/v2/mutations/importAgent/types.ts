import { Agent } from '@shinkai_network/shinkai-message-ts/api/agents/types';
import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';

export type ImportAgentInput = Token & {
  nodeAddress: string;
  file: File;
};

export type ImportAgentOutput = Agent;
