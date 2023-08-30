import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { uploadVRFiles } from '.';
import { UploadVRFilesInput, UploadVRFilesOutput } from './types';

type Options = UseMutationOptions<
  UploadVRFilesOutput,
  Error,
  UploadVRFilesInput
>;

export const useUploadVRFiles = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadVRFiles,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKey.GET_VR_FILES],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
