import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { DirectoryContent } from '@shinkai_network/shinkai-message-ts/api/vector-fs/types';
import { QueryObserverOptions } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';

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
