import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';

export type RemovePromptOutput = {
  status: string;
};

export type RemovePromptInput = Token & {
  nodeAddress: string;
  promptName: string;
};
