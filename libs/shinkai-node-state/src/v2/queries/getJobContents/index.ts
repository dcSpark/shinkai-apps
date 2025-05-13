import { retrieveFilesForJob as retrieveFilesForJobApi } from '@shinkai_network/shinkai-message-ts/api/vector-fs/index';

import { GetJobContentsInput } from './types';

export const getJobContents = async ({
  nodeAddress,
  jobId,
  token,
}: GetJobContentsInput) => {
  const response = await retrieveFilesForJobApi(nodeAddress, token, {
    job_id: jobId,
  });

  return response;
};
