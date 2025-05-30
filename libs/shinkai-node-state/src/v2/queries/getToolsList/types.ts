import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  type GetToolsCategory,
  type GetToolsResponse,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetToolsListInput = Token & {
  nodeAddress: string;
  category?: GetToolsCategory;
};

export type GetToolsListOutput = GetToolsResponse;
