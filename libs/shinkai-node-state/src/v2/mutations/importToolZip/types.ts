import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type ImportToolZipResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type ImportToolFromZipInput = Token & {
  nodeAddress: string;
  file: File;
};

export type ImportToolFromZipOutput = ImportToolZipResponse;
