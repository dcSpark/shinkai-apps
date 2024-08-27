import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { SearchWorkflowsResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetWorkflowSearchInput = Token & {
  nodeAddress: string;
  search: string;
};

export type GetWorkflowSearchOutput = SearchWorkflowsResponse;
