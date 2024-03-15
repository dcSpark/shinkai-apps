import { UseMutationOptions, useQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getVRPathSimplified } from './index';
import { GetVRPathSimplifiedInput, VRFolder } from './types';

type Options = UseMutationOptions<VRFolder, Error, GetVRPathSimplifiedInput>;

export const useGetVRPathSimplified = (
  input: GetVRPathSimplifiedInput,
  options?: Options,
) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_VR_FILES, input],
    queryFn: () => getVRPathSimplified(input),
    ...options,
  });
  return response;
};
