import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type ShinkaiToolHeader, type ShinkaiToolType } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetToolsFromToolsetInput = Token & {
  nodeAddress: string;
  tool_set_key: string;
};

export type GetToolsFromToolsetOutput = {
  type: ShinkaiToolType;
  content: [ShinkaiToolHeader, boolean];
}[];
