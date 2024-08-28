import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { GetAllInboxesResponse } from '@shinkai_network/shinkai-message-ts/api/jobs/types';
import { QueryObserverOptions } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';

export type GetInboxesInput = Token & {
  nodeAddress: string;
};
export type GetInboxesOutput = GetAllInboxesResponse;
export type UseGetInboxes = [FunctionKeyV2.GET_INBOXES, GetInboxesInput];

export type Options = QueryObserverOptions<
  GetInboxesOutput,
  Error,
  GetInboxesOutput,
  GetInboxesOutput,
  UseGetInboxes
>;
