import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getJobFolderName } from './index';
import { GetJobFolderNameInput, Options } from './types';

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
