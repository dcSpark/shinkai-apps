import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';

export type DownloadFileOutput = string;

export type GetDownloadFileInput = Token & {
  nodeAddress: string;
  path: string;
};
