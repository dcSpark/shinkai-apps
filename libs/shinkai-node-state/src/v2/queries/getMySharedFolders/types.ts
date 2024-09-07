import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { GetMySharedFoldersResponse } from '@shinkai_network/shinkai-message-ts/api/subscriptions/types';
import { QueryObserverOptions } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';

export type GetMySharedFoldersInput = Token & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
};
export type UseGetMySharedFolders = [
  FunctionKeyV2.GET_MY_SHARED_FOLDERS,
  GetMySharedFoldersInput,
];

export type GetMyShareFoldersOutput = GetMySharedFoldersResponse;

export type Options = QueryObserverOptions<
  GetMyShareFoldersOutput,
  Error,
  GetMyShareFoldersOutput,
  GetMyShareFoldersOutput,
  UseGetMySharedFolders
>;
