import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getMySharedFolders } from '.';
import { GetMySharedFoldersInput, Options } from './types';

export const useGetMySharedFolders = (
  input: GetMySharedFoldersInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_MY_SHARED_FOLDERS, input],
    queryFn: async () => await getMySharedFolders(input),
    ...options,
  });
  return response;
};
