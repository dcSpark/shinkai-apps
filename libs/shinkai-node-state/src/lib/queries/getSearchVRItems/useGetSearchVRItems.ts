import { QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getSearchVRItems } from './index';
import { GetVRSearchItemsInput, GetVRSearchItemsOutput } from './types';

export type UseGetSearchVRItems = [
  FunctionKey.GET_VR_FILES_SEARCH,
  GetVRSearchItemsInput,
];

type Options = QueryObserverOptions<
  GetVRSearchItemsOutput,
  Error,
  GetVRSearchItemsOutput,
  GetVRSearchItemsOutput,
  UseGetSearchVRItems
>;

export const useGetSearchVRItems = (
  input: GetVRSearchItemsInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_VR_FILES_SEARCH, input],
    queryFn: () => getSearchVRItems(input),
    ...options,
  });
  return response;
};
