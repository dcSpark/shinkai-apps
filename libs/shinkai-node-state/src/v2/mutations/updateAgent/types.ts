import {
  Agent,
  UpdateAgentResponse,
} from '@shinkai_network/shinkai-message-ts/api/agents/types';
import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';

export type UpdateAgentOutput = UpdateAgentResponse;

export type UpdateAgentInput = Token & {
  nodeAddress: string;
  agent: Agent;
};
