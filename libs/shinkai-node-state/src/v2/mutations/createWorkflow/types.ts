import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { AddWorkflowResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type CreateWorkflowOutput = AddWorkflowResponse;

export type CreateWorkflowInput = Token & {
  nodeAddress: string;
  raw: string;
  description: string;
};
