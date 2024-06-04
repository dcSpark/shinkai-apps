import { useQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getVRPathSimplified } from './index';
import { GetVRPathSimplifiedInput, Options } from './types';

export const useGetVRPathSimplified = (
  input: GetVRPathSimplifiedInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_VR_FILES, input],
    queryFn: () => getVRPathSimplified(input),
    ...options,
  });
  return response;
};
