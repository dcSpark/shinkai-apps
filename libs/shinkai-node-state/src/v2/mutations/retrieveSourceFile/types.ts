import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { RetrieveSourceFileResponse } from '@shinkai_network/shinkai-message-ts/api/vector-fs/types';

export type RetrieveSourceFileOutput = RetrieveSourceFileResponse;

export type RetrieveSourceFileInput = Token & {
  nodeAddress: string;
  filePath: string;
};
