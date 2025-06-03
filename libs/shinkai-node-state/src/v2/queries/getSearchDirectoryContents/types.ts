import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type GetSearchDirectoryContentsResponse } from '@shinkai_network/shinkai-message-ts/api/vector-fs/types';

export type GetSearchDirectoryContentsInput = Token & {
  nodeAddress: string;
  name: string;
};
export type GetSearchDirectoryContentsOutput =
  GetSearchDirectoryContentsResponse;
