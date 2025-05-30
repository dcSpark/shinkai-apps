import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';

export type SetMaxChatIterationsInput = Token & {
  nodeAddress: string;
  maxIterations: number;
};

export type SetMaxChatIterationsOutput = string;
