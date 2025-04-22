import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';

export type SetMaxChatIterationsInput = Token & {
  nodeAddress: string;
  maxIterations: number;
};

// The setPreferences endpoint returns 'any' for now.
export type SetMaxChatIterationsOutput = any;
