import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type GetJobFolderNameResponse } from '@shinkai_network/shinkai-message-ts/api/jobs/types';
import { type UseQueryOptions } from '@tanstack/react-query';

import { type FunctionKeyV2 } from '../../constants';

export type GetJobFolderNameInput = Token & {
  nodeAddress: string;
  jobId: string;
};

export type GetJobFolderNameOutput = GetJobFolderNameResponse;

export type GetJobFolderNameQueryKey = [
  FunctionKeyV2.GET_JOB_FOLDER_NAME,
  string,
];

export type Options = UseQueryOptions<
  GetJobFolderNameOutput,
  Error,
  GetJobFolderNameOutput,
  GetJobFolderNameQueryKey
>;
