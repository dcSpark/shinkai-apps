import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  GetAllInboxesWithPaginationRequest,
  GetAllInboxesWithPaginationResponse,
} from '@shinkai_network/shinkai-message-ts/api/jobs/types';
import { QueryObserverOptions } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';

export type GetInboxesInput = Token & {
  nodeAddress: string;
} & GetAllInboxesWithPaginationRequest;

export type GetAgentInboxesInput = Token & {
  nodeAddress: string;
  agentId: string;
  showHidden?: boolean;
};

export type GetInboxesOutput = GetAllInboxesWithPaginationResponse;

export type UseGetInboxes = [
  FunctionKeyV2.GET_INBOXES_WITH_PAGINATION,
  GetInboxesInput,
];

export type Options = QueryObserverOptions<
  GetInboxesOutput,
  Error,
  GetInboxesOutput,
  GetInboxesOutput,
  UseGetInboxes
>;
