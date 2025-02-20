import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { ToggleEnableToolResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type ToggleEnableToolOutput = ToggleEnableToolResponse;

export type ToggleEnableToolInput = Token & {
  nodeAddress: string;
  toolKey: string;
  isToolEnabled: boolean;
};
