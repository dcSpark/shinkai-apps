import { getShinkaiFreeModelQuota as getShinkaiFreeModelQuotaApi } from '@shinkai_network/shinkai-message-ts/api/general/index';
import { GetShinkaiFreeModelQuotaResponse } from '@shinkai_network/shinkai-message-ts/api/general/types';

import {
  GetShinkaiFreeModelQuotaInput,
  GetShinkaiFreeModelQuotaOutput,
} from './types';

const TOKENS_PER_MESSAGE = 2000;

const parseQuotaToMessages = (quota: GetShinkaiFreeModelQuotaResponse) => {
  const totalMessages = Math.floor(quota.tokens_quota / TOKENS_PER_MESSAGE);
  const usedMessages = Math.floor(quota.used_tokens / TOKENS_PER_MESSAGE);
  const remainingMessages = totalMessages - usedMessages;

  return {
    remainingMessages,
    totalMessages,
    resetTime: quota.reset_time,
    hasQuota: quota.has_quota,
    usedTokens: quota.used_tokens,
    tokensQuota: quota.tokens_quota,
  };
};

export const getShinkaiFreeModelQuota = async ({
  nodeAddress,
  token,
}: GetShinkaiFreeModelQuotaInput): Promise<GetShinkaiFreeModelQuotaOutput> => {
  const response = await getShinkaiFreeModelQuotaApi(nodeAddress, token);
  const parsedResponse = parseQuotaToMessages(response);
  return parsedResponse;
};
