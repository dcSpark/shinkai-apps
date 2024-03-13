import { UseMutationOptions, useQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getVRPathSimplified } from './index';
import { GetVRPathSimplifiedInput, GetVRPathSimplifiedOutput } from './types';

type Options = UseMutationOptions<
  GetVRPathSimplifiedOutput,
  Error,
  GetVRPathSimplifiedInput
>;

export const useGetVRPathSimplified = (
  input: GetVRPathSimplifiedInput,
  options?: Options,
) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_NODE_FILES],
    queryFn: () => getVRPathSimplified(input),
    ...options,
  });
  return { ...response };
};
