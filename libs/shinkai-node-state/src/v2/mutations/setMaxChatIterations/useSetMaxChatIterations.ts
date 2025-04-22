import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { APIError } from '../../types';
import { setMaxChatIterations } from '.';
import { SetMaxChatIterationsInput, SetMaxChatIterationsOutput } from './types';

type Options = UseMutationOptions<
  SetMaxChatIterationsOutput,
  APIError,
  SetMaxChatIterationsInput
>;

export const useSetMaxChatIterations = (options?: Options) => {
  return useMutation({
    mutationFn: setMaxChatIterations,
    ...options,
  });
};
