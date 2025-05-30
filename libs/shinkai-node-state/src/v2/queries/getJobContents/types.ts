import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type DirectoryContent } from '@shinkai_network/shinkai-message-ts/api/vector-fs/types';
import { type QueryObserverOptions } from '@tanstack/react-query';

import { type FunctionKeyV2 } from '../../constants';

export type GetJobContentsInput = Token & {
  nodeAddress: string;
  jobId: string;
};

export type UseGetJobContents = [
  FunctionKeyV2.GET_JOB_CONTENTS,
  GetJobContentsInput,
];

export type GetJobContentsOutput = DirectoryContent[];

export type Options = QueryObserverOptions<
  GetJobContentsOutput,
  Error,
  GetJobContentsOutput,
  GetJobContentsOutput,
  UseGetJobContents
>;
