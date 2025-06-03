import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type CopyFsItemResponse } from '@shinkai_network/shinkai-message-ts/api/vector-fs/types';

export type CopyVRItemOutput = CopyFsItemResponse;

export type CopyVRItemInput = Token & {
  nodeAddress: string;
  originPath: string;
  destinationPath: string;
};
