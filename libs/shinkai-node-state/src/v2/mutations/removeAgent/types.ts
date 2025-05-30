import { type RemoveAgentResponse } from '@shinkai_network/shinkai-message-ts/api/agents/types';
import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';

export type RemoveAgentInput = Token & {
  nodeAddress: string;
  agentId: string;
};
export type RemoveAgentOutput = RemoveAgentResponse;
