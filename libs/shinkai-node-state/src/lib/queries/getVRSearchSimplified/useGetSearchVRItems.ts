import { QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getVRSearchSimplified } from './index';
import {
  GetVRSearchSimplifiedInput,
  GetVRSearchSimplifiedOutput,
} from './types';

export type UseGetSearchVRItems = [
  FunctionKey.GET_VR_SEARCH_SIMPLIFIED,
  GetVRSearchSimplifiedInput,
];

type Options = QueryObserverOptions<
  GetVRSearchSimplifiedOutput,
  Error,
  GetVRSearchSimplifiedOutput,
  GetVRSearchSimplifiedOutput,
  UseGetSearchVRItems
>;

export const useGetVRSeachSimplified = (
  input: GetVRSearchSimplifiedInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_VR_SEARCH_SIMPLIFIED, input],
    queryFn: () => getVRSearchSimplified(input),
    ...options,
  });
  return response;
};
