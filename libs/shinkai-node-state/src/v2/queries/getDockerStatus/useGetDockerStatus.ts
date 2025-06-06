import { useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetDockerStatusInput, type Options } from './types';
import { getDockerStatus } from '.';

export const useGetDockerStatus = (
  input: GetDockerStatusInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_DOCKER_STATUS, input] as const,
    queryFn: async () => await getDockerStatus(input),
    ...options,
  });
  return response;
};
