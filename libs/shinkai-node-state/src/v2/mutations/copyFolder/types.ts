import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type CopyFolderResponse } from '@shinkai_network/shinkai-message-ts/api/vector-fs/types';

export type CopyFolderOutput = CopyFolderResponse;

export type CopyFolderInput = Token & {
  nodeAddress: string;
  originPath: string;
  destinationPath: string;
};
