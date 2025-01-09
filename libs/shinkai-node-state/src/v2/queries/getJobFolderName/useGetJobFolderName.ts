import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getJobFolderName } from './index';
import { GetJobFolderNameInput } from './types';

export const useGetJobFolderName = (input: GetJobFolderNameInput) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_JOB_FOLDER_NAME, input],
    queryFn: () => getJobFolderName(input),
  });
  return response;
};
