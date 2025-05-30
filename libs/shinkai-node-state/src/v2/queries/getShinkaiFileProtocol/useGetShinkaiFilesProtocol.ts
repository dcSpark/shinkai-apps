import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import {
  type GetShinkaiFilesProtocolInput,
  type GetShinkaiFilesProtocolOutput,
} from './types';
import { getShinkaiFilesProtocol } from './index';

export type UseGetShinkaiFilesProtocol = [
  FunctionKeyV2.GET_SHINKAI_FILE_PROTOCOLS,
  GetShinkaiFilesProtocolInput,
];
type Options = QueryObserverOptions<
  GetShinkaiFilesProtocolOutput,
  Error,
  GetShinkaiFilesProtocolOutput,
  GetShinkaiFilesProtocolOutput,
  UseGetShinkaiFilesProtocol
>;

export const useGetShinkaiFilesProtocol = (
  input: GetShinkaiFilesProtocolInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_SHINKAI_FILE_PROTOCOLS, input],
    queryFn: () => getShinkaiFilesProtocol(input),
    ...options,
  });
  return response;
};
