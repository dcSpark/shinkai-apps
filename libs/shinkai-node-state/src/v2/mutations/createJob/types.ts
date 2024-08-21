import {
  VRFolder,
  VRItem,
} from '../../../lib/queries/getVRPathSimplified/types';

export type CreateJobInput = {
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
