import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { APIError } from '../../types';
import { executeToolCode } from '.';
import { ExecuteToolCodeInput, ExecuteToolCodeOutput } from './types';

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
