import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { MoveFolderResponse } from '@shinkai_network/shinkai-message-ts/api/vector-fs/types';

export type MoveFolderOutput = MoveFolderResponse;

export type MoveVRFolderInput = Token & {
  nodeAddress: string;
  originPath: string;
  destinationPath: string;
};
