import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { JobConfig } from '@shinkai_network/shinkai-message-ts/api/jobs/types';
import { ShinkaiPath } from '@shinkai_network/shinkai-message-ts/models';

export type CreateJobInput = Token & {
  nodeAddress: string;
  llmProvider: string;
  sheetId?: string;
  content: string;
  isHidden: boolean;
  toolKey?: string;
  files?: File[];
  selectedVRFiles?: ShinkaiPath[];
  selectedVRFolders?: ShinkaiPath[];
  chatConfig?: JobConfig;
};

export type CreateJobOutput = {
  jobId: string;
};
