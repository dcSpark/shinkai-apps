import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  VectorFSFolderScopeEntry,
  VectorFSItemScopeEntry,
} from '@shinkai_network/shinkai-message-ts/models/SchemaTypes';

export type CreateJobInput = Token & {
  nodeAddress: string;
  llmProvider: string;
  sheetId?: string;
  content: string;
  isHidden: boolean;
  workflowName?: string;
  workflowCode?: string;
  files?: File[];
  selectedVRFiles?: VectorFSItemScopeEntry[];
  selectedVRFolders?: VectorFSFolderScopeEntry[];
};

export type CreateJobOutput = {
  jobId: string;
};
