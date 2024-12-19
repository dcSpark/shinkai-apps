import {
  CustomToolHeaders,
  Token,
} from '@shinkai_network/shinkai-message-ts/api/general/types';
import { GetAllToolAssetsResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetAllToolAssetsInput = Token &
  CustomToolHeaders & {
    nodeAddress: string;
  };

export type GetAllToolAssetsOutput = GetAllToolAssetsResponse;
