import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getListDirectoryContents } from './index';
import { GetVRPathSimplifiedInput, Options } from './types';

export const useGetListDirectoryContents = (
  input: GetVRPathSimplifiedInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_VR_FILES, input],
    queryFn: () => getListDirectoryContents(input),
    ...options,
  });
  return response;
};
