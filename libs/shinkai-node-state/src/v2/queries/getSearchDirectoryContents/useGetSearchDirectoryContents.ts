import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import {
  type GetSearchDirectoryContentsInput,
  type GetSearchDirectoryContentsOutput,
} from './types';
import { getSearchDirectoryContents } from './index';

export type UseGetSearchDirectoryContents = [
  FunctionKeyV2.GET_VR_FILES_SEARCH,
  GetSearchDirectoryContentsInput,
];

type Options = QueryObserverOptions<
  GetSearchDirectoryContentsOutput,
  Error,
  GetSearchDirectoryContentsOutput,
  GetSearchDirectoryContentsOutput,
  UseGetSearchDirectoryContents
>;

export const useGetSearchDirectoryContents = (
  input: GetSearchDirectoryContentsInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_VR_FILES_SEARCH, input],
    queryFn: () => getSearchDirectoryContents(input),
    ...options,
  });
  return response;
};
