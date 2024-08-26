import {
  ShinkaiTool,
  ShinkaiToolType,
  UpdateToolResponse,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type UpdateToolOutput = UpdateToolResponse;

export type UpdateToolInput = {
  nodeAddress: string;
  toolKey: string;
  toolType: ShinkaiToolType;
  toolPayload: ShinkaiTool;
  isToolEnabled: boolean;
};
