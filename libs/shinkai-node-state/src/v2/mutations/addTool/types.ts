import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  ShinkaiTool,
  ShinkaiToolType,
  UpdateToolResponse,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type AddToolOutput = UpdateToolResponse;

export type AddToolInput = Token & {
  nodeAddress: string;
  toolType: ShinkaiToolType;
  toolPayload: ShinkaiTool;
  isToolEnabled: boolean;
};
