import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';

import {
  VRFolder,
  VRItem,
} from '../../../lib/queries/getVRPathSimplified/types';

export type CreateJobInput = Token & {
  nodeAddress: string;
  llmProvider: string;
  sheetId?: string;
  content: string;
  isHidden: boolean;
  workflowName?: string;
  workflowCode?: string;
  files?: File[];
  selectedVRFiles?: VRItem[];
  selectedVRFolders?: VRFolder[];
};

export type CreateJobOutput = {
  jobId: string;
};
