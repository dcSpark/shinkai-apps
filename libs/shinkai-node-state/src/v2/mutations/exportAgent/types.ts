import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';

export type ExportAgentInput = Token & {
  nodeAddress: string;
  agentId: string;
};

export type ExportAgentOutput = Blob;
