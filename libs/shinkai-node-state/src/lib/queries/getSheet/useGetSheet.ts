import { QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getSheet } from './';
import { GetSheetInput, GetSheetOutput } from './types';

export type UseGetSheet = [FunctionKey.GET_SHEET, GetSheetInput];

type Options = QueryObserverOptions<
  GetSheetOutput,
  Error,
  GetSheetOutput,
  GetSheetOutput,
  UseGetSheet
>;

export const useGetSheet = (
  input: GetSheetInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_SHEET, input],
    queryFn: () => getSheet(input),
    ...options,
  });
  return response;
};
