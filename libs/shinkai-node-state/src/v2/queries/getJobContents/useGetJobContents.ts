import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetJobContentsInput, type Options } from './types';
import { getJobContents } from './index';

export const useGetJobContents = (
  input: GetJobContentsInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_JOB_CONTENTS, input],
    queryFn: () => getJobContents(input),
    ...options,
  });
  return response;
};
