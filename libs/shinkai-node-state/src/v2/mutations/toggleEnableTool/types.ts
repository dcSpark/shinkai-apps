import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type ToggleEnableToolResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type ToggleEnableToolOutput = ToggleEnableToolResponse;

export type ToggleEnableToolInput = Token & {
  nodeAddress: string;
  toolKey: string;
  isToolEnabled: boolean;
};
