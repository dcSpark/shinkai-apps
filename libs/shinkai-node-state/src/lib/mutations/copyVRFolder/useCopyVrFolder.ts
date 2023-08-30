import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { copyVRFolder } from './index';
import { CopyVRFolderInput, CopyVRFolderOutput } from './types';

type Options = UseMutationOptions<CopyVRFolderOutput, Error, CopyVRFolderInput>;

export const useCopyVrFolder = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: copyVRFolder,
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
