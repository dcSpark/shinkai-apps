import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';

export type SetNgrokEnabledInput = Token & {
  nodeAddress: string;
  enabled: boolean;
};

export type SetNgrokEnabledOutput = {
  tunnel?: string;
};
