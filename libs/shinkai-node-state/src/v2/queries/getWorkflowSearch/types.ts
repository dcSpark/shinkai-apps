import { SearchWorkflowsResponse } from '@shinkai_network/shinkai-message-ts/api/workflow/types';

export type GetWorkflowSearchInput = {
  nodeAddress: string;
  search: string;
};

export type GetWorkflowSearchOutput = SearchWorkflowsResponse;
