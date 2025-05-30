import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import {
  type GetShinkaiFileProtocolInput,
  type GetShinkaiFileProtocolOutput,
} from './types';
import { getShinkaiFileProtocol } from './index';

export type UseGetShinkaiFileProtocol = [
  FunctionKeyV2.GET_SHINKAI_FILE_PROTOCOL,
  GetShinkaiFileProtocolInput,
];
type Options = QueryObserverOptions<
  GetShinkaiFileProtocolOutput,
  Error,
  GetShinkaiFileProtocolOutput,
  GetShinkaiFileProtocolOutput,
  UseGetShinkaiFileProtocol
>;

export const useGetShinkaiFileProtocol = (
  input: GetShinkaiFileProtocolInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_SHINKAI_FILE_PROTOCOL, input],
    queryFn: () => getShinkaiFileProtocol(input),
    ...options,
  });
  return response;
};
