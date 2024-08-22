import { ListAllWorkflowsResponse } from '@shinkai_network/shinkai-message-ts/models/v2/types';

export type GetWorkflowListInput = {
  nodeAddress: string;
};

export type GetWorkflowListOutput = ListAllWorkflowsResponse;
