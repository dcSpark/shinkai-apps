import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { FunctionKey, queryClient } from '../../constants';
import { copyVRItem } from './index';
import { CopyVRItemInput, CopyVRItemOutput } from './types';

type Options = UseMutationOptions<CopyVRItemOutput, Error, CopyVRItemInput>;

export const useCopyVrItem = (options?: Options) => {
  return useMutation({
    mutationFn: copyVRItem,
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
