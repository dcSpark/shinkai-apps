import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { FunctionKey, queryClient } from '../../constants';
import { uploadVRFiles } from '.';
import { UploadVRFilesInput, UploadVRFilesOutput } from './types';

type Options = UseMutationOptions<
  UploadVRFilesOutput,
  Error,
  UploadVRFilesInput
>;

export const useUploadVRFiles = (options?: Options) => {
  return useMutation({
    mutationFn: uploadVRFiles,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_NODE_FILES],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
