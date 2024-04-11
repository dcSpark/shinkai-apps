import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models/Payloads';
import { QueryObserverOptions } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';

export type GetAvailableSharedItemsInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
};
export type UseGetAvailableSharedItems = [
  FunctionKey.GET_AVAILABLE_SHARED_ITEMS,
  GetAvailableSharedItemsInput,
];
export type GetAvailableSharedItemsOutput = {
  is_pristine: boolean;
  node_name: string;
  status: string;
  version: string;
};

export type Options = QueryObserverOptions<
  GetAvailableSharedItemsOutput,
  Error,
  GetAvailableSharedItemsOutput,
  GetAvailableSharedItemsOutput,
  UseGetAvailableSharedItems
>;
