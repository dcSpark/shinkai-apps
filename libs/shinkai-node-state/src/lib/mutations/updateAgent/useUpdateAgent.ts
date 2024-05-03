import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { updateAgent } from '.';
import { UpdateAgentInput, UpdateAgentOutput } from './types';

type Options = UseMutationOptions<UpdateAgentOutput, Error, UpdateAgentInput>;

export const useUpdateAgent = (options?: Options) => {
  return useMutation({
    mutationFn: updateAgent,
    ...options,
  });
};
