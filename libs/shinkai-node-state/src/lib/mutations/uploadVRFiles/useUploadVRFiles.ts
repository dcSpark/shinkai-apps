import { useMutation } from '@tanstack/react-query';

import { FunctionKey, queryClient } from '../../constants';
import { uploadVRFiles } from '.';

export const useUploadVRFiles = () => {
  return useMutation({
    mutationFn: uploadVRFiles,
    onSuccess: () => {
      // queryClient.invalidateQueries({
      //   queryKey: [FunctionKey.GET],
      // });
    },
  });
};
