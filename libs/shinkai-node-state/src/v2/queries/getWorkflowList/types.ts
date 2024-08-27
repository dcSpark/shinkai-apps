import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { ListAllWorkflowsResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetWorkflowListInput = Token & {
  nodeAddress: string;
};

export type GetWorkflowListOutput = ListAllWorkflowsResponse;
