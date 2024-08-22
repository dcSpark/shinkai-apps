import { SearchWorkflowsResponse } from '@shinkai_network/shinkai-message-ts/models/v2/types';

export type GetWorkflowSearchInput = {
  nodeAddress: string;
  search: string;
};

export type GetWorkflowSearchOutput = SearchWorkflowsResponse;
