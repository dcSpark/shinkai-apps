import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type CreateFolderResponse } from '@shinkai_network/shinkai-message-ts/api/vector-fs/types';

export type CreateFolderInput = Token & {
  nodeAddress: string;
  path: string;
  folderName: string;
};

export type CreateFolderOutput = CreateFolderResponse;
