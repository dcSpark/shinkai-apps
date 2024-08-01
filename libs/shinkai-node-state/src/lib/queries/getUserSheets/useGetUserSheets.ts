import { QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getUserSheets } from './';
import { GetUserSheetsInput, GetUserSheetsOutput } from './types';

export type UseGetUserSheets = [
  FunctionKey.GET_USER_SHEETS,
  GetUserSheetsInput,
];

type Options = QueryObserverOptions<
  GetUserSheetsOutput,
  Error,
  GetUserSheetsOutput,
  GetUserSheetsOutput,
  UseGetUserSheets
>;

export const useGetUserSheets = (
  input: GetUserSheetsInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_USER_SHEETS, input],
    queryFn: () => getUserSheets(input),
    ...options,
  });
  return response;
};
