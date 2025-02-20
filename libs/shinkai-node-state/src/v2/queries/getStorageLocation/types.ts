import {
  GetNodeStorageLocationResponse,
  Token,
} from '@shinkai_network/shinkai-message-ts/api/general/types';

export type GetStorageLocationInput = Token & {
  nodeAddress: string;
};

export type GetStorageLocationOutput = GetNodeStorageLocationResponse;
