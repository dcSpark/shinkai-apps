import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { DirectoryContent } from '@shinkai_network/shinkai-message-ts/api/vector-fs/types';
import { QueryObserverOptions } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';

export type GetVRPathSimplifiedInput = Token & {
  nodeAddress: string;
  path: string;
  depth?: number;
};

export type UseGetDirectoryContents = [
  FunctionKeyV2.GET_VR_FILES,
  GetVRPathSimplifiedInput,
];

export type GetVRPathSimplifiedOutput = DirectoryContent[];

export type Options = QueryObserverOptions<
  GetVRPathSimplifiedOutput,
  Error,
  GetVRPathSimplifiedOutput,
  GetVRPathSimplifiedOutput,
  UseGetDirectoryContents
>;
