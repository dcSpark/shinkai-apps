import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { APIError } from '../../types';
import { retrieveSourceFile } from './index';
import { RetrieveSourceFileInput, RetrieveSourceFileOutput } from './types';

type Options = UseMutationOptions<
  RetrieveSourceFileOutput,
  APIError,
  RetrieveSourceFileInput
>;

export const useRetrieveSourceFile = (options?: Options) => {
  return useMutation({
    mutationFn: retrieveSourceFile,
    ...options,
  });
};
