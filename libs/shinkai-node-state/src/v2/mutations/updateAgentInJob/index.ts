import { updateLLMProviderInJob } from '@shinkai_network/shinkai-message-ts/api/jobs/index';

import { UpdateAgentInJobInput } from './types';

export const updateAgentInJob = async ({
  nodeAddress,
  token,
  jobId,
  newAgentId,
}: UpdateAgentInJobInput) => {
  const response = await updateLLMProviderInJob(nodeAddress, token, {
    job_id: jobId,
    new_agent_id: newAgentId,
  });
  return response;
};
