import { stopGeneratingLLM as stopGeneratingLLMApi } from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { StopGeneratingLLMInput } from './types';

export const stopGeneratingLLM = async ({
  nodeAddress,
  token,
  jobId,
}: StopGeneratingLLMInput) => {
  const response = await stopGeneratingLLMApi(nodeAddress, token, jobId);
  return response;
};
