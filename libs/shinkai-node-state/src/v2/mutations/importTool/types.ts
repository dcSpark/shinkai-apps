import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { ImportToolResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type ImportToolInput = Token & {
  nodeAddress: string;
  url: string;
};

export type ImportToolOutput = ImportToolResponse;
