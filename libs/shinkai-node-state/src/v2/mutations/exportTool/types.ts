import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type ExportToolResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type ExportToolInput = Token & {
  nodeAddress: string;
  toolKey: string;
};

export type ExportToolOutput = ExportToolResponse;
