import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  CopyToolAssetsRequest,
  CopyToolAssetsResponse,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type CopyToolAssetsInput = Token & {
  nodeAddress: string;
  currentToolKeyPath: CopyToolAssetsRequest['first_path'];
  xShinkaiAppId: CopyToolAssetsRequest['second_path'];
};

export type CopyToolAssetsOutput = CopyToolAssetsResponse;
