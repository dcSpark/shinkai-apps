import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { uploadPlaygroundToolFiles } from '.';
import {
  UploadPlaygroundToolFilesInput,
  UploadPlaygroundToolFilesOutput,
} from './types';

type Options = UseMutationOptions<
  UploadPlaygroundToolFilesOutput,
  APIError,
  UploadPlaygroundToolFilesInput
>;

export const useUploadPlaygroundToolFiles = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadPlaygroundToolFiles,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_ALL_TOOL_ASSETS],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
