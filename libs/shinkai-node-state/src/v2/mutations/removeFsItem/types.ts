import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type RemoveFsItemResponse } from '@shinkai_network/shinkai-message-ts/api/vector-fs/types';

export type RemoveFsItemOutput = RemoveFsItemResponse;
export type RemoveFsItemInput = Token & {
  nodeAddress: string;
  itemPath: string;
};
