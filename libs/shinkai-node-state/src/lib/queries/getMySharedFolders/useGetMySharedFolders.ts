import { useQuery } from '@tanstack/react-query';

import { getMySharedFolders } from '.';
import { FunctionKey } from '../../constants';
import { GetMySharedFoldersInput, Options } from './types';

export const useGetMySharedFolders = (
  input: GetMySharedFoldersInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_MY_SHARED_FOLDERS, input],
    queryFn: async () => await getMySharedFolders(input),
    ...options,
  });
  return response;
};
