import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type ImportToolResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type ImportToolInput = Token & {
  nodeAddress: string;
  url: string;
};

export type ImportToolOutput = ImportToolResponse;
