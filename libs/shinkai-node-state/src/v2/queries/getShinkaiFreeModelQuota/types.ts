import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { QueryObserverOptions } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';

export type GetShinkaiFreeModelQuotaInput = Token & {
  nodeAddress: string;
};
export type UseGetShinkaiFreeModelQuota = [
  FunctionKeyV2.GET_SHINKAI_FREE_MODEL_QUOTA,
  GetShinkaiFreeModelQuotaInput,
];
export type GetShinkaiFreeModelQuotaOutput = {
  hasQuota: boolean;
  remainingMessages: number;
  totalMessages: number;
  resetTime: number;
  usedTokens: number;
  tokensQuota: number;
};

export type Options = QueryObserverOptions<
  GetShinkaiFreeModelQuotaOutput,
  Error,
  GetShinkaiFreeModelQuotaOutput,
  GetShinkaiFreeModelQuotaOutput,
  UseGetShinkaiFreeModelQuota
>;
