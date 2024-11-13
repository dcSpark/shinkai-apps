import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { JobConfig } from '@shinkai_network/shinkai-message-ts/api/jobs/types';
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
  files?: File[];
  selectedVRFiles?: VectorFSItemScopeEntry[];
  selectedVRFolders?: VectorFSFolderScopeEntry[];
  chatConfig?: JobConfig;
};

export type CreateJobOutput = {
  jobId: string;
};
