import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  ShinkaiTool,
  ShinkaiToolType,
  UpdateToolResponse,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type CreateToolOutput = UpdateToolResponse;

export type CreateToolInput = Token & {
  nodeAddress: string;
  toolType: ShinkaiToolType;
  toolPayload: ShinkaiTool;
  isToolEnabled: boolean;
};
