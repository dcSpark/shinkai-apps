import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { GetMySubscriptionsResponse } from '@shinkai_network/shinkai-message-ts/api/subscriptions/types';
import { QueryObserverOptions } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';

export type GetMySubscriptionsInput = Token & {
  nodeAddress: string;
};

export type UseGetAvailableSharedItems = [
  FunctionKeyV2.GET_MY_SUBSCRIPTIONS,
  GetMySubscriptionsInput,
];

export type GetMySubscriptionsOutput = GetMySubscriptionsResponse;

export type Options = QueryObserverOptions<
  GetMySubscriptionsOutput,
  Error,
  GetMySubscriptionsOutput,
  GetMySubscriptionsOutput,
  UseGetAvailableSharedItems
>;
