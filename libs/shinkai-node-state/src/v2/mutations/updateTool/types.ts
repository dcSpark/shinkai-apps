import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  type ShinkaiTool,
  type ShinkaiToolType,
  type UpdateToolResponse,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type UpdateToolOutput = UpdateToolResponse;

export type UpdateToolInput = Token & {
  nodeAddress: string;
  toolKey: string;
  toolType: ShinkaiToolType;
  toolPayload: ShinkaiTool;
  isToolEnabled: boolean;
};
