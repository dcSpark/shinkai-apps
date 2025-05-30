import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type RemoveFolderResponse } from '@shinkai_network/shinkai-message-ts/api/vector-fs/types';

export type RemoveFolderOutput = RemoveFolderResponse;

export type RemoveFolderInput = Token & {
  nodeAddress: string;
  folderPath: string;
};
