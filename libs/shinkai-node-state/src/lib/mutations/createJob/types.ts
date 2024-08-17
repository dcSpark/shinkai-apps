import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

import { VRFolder, VRItem } from '../../queries/getVRPathSimplified/types';

export type AssociatedUI =
  | { type: 'Sheet'; value: string }
  // Add more variants as needed
  ;

export type CreateJobInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  agentId: string;
  content: string;
  files_inbox: string;
  files?: File[];
  is_hidden?: boolean;
  workflow?: string;
  workflowName?: string;
  selectedVRFiles?: VRItem[];
  selectedVRFolders?: VRFolder[];
  associated_ui?: AssociatedUI;
};

export type CreateJobOutput = {
  jobId: string;
};
