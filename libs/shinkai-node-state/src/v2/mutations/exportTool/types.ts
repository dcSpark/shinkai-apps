import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { ExportToolResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type ExportToolInput = Token & {
  nodeAddress: string;
  toolKey: string;
};

export type ExportToolOutput = ExportToolResponse;
