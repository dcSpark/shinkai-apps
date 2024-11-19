import {
  createJob as createJobApi,
  updateChatConfig,
} from '@shinkai_network/shinkai-message-ts/api/jobs/index';
import { toolMetadataImplementation as createToolMetadataApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';
import { CodeLanguage } from '@shinkai_network/shinkai-message-ts/api/tools/types';

import { CreateToolMetadataInput } from './types';

export const createToolMetadata = async ({
  nodeAddress,
  token,
  jobId,
}: CreateToolMetadataInput) => {
  return await createToolMetadataApi(nodeAddress, token, {
    job_id: jobId,
    language: CodeLanguage.Typescript,
  });
};
