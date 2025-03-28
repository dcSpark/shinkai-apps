import {
  Agent,
  CreateAgentResponse,
} from '@shinkai_network/shinkai-message-ts/api/agents/types';
import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';

export type CreateAgentOutput = CreateAgentResponse;

export type CreateAgentInput = Token & {
  nodeAddress: string;
  agent: Agent;
  cronExpression?: string;
};
