import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetJobFolderNameInput, type Options } from './types';
import { getJobFolderName } from './index';

export const useGetJobFolderName = (
  input: GetJobFolderNameInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_JOB_FOLDER_NAME, input.jobId],
    queryFn: () => getJobFolderName(input),
    ...options,
  });
  return response;
};
