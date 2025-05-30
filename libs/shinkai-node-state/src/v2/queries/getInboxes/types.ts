import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  type GetAllInboxesWithPaginationRequest,
  type GetAllInboxesWithPaginationResponse,
} from '@shinkai_network/shinkai-message-ts/api/jobs/types';
import { type QueryObserverOptions } from '@tanstack/react-query';

import { type FunctionKeyV2 } from '../../constants';

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
