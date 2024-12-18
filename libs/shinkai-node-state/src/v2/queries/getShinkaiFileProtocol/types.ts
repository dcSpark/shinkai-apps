import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { GetShinkaiFileProtocolResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetShinkaiFileProtocolInput = Token & {
  nodeAddress: string;
  file: string;
};

export type GetShinkaiFileProtocolOutput = GetShinkaiFileProtocolResponse;
