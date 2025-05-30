import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { type APIError } from '../../types';
import { type ExecuteToolCodeInput, type ExecuteToolCodeOutput } from './types';
import { executeToolCode } from '.';

type Options = UseMutationOptions<
  ExecuteToolCodeOutput,
  APIError,
  ExecuteToolCodeInput
>;

export const useExecuteToolCode = (options?: Options) => {
  return useMutation({
    mutationFn: executeToolCode,
    ...options,
  });
};
