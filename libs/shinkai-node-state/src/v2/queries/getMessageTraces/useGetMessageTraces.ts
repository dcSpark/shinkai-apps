import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetMessageTracesInput, type Options } from './types';
import { getMessageTraces } from './index';

export const useGetMessageTraces = (
  input: GetMessageTracesInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_MESSAGE_TRACES, input],
    queryFn: () => getMessageTraces(input),
    ...options,
  });
  return response;
};
