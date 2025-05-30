import { type GetAgentsResponse } from '@shinkai_network/shinkai-message-ts/api/agents/types';
import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';

export type GetAgentsInput = Token & {
  nodeAddress: string;
  categoryFilter?: 'recently_used';
};

export type GetAgentsOutput = GetAgentsResponse;
