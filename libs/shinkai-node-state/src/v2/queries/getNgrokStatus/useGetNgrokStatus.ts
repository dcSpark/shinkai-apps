import { useQuery } from '@tanstack/react-query';
import { FunctionKeyV2 } from '../../constants';
import { type GetNgrokStatusInput, type Options } from './types';
import { getNgrokStatus } from '.';

export const useGetNgrokStatus = (
  input: GetNgrokStatusInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_NGROK_STATUS, input] as const,
    queryFn: () => getNgrokStatus(input),
    ...options,
  });
  return response;
};
