import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { copyVRItem } from './index';
import { CopyVRItemInput, CopyVRItemOutput } from './types';

type Options = UseMutationOptions<CopyVRItemOutput, Error, CopyVRItemInput>;

export const useCopyVrItem = (options?: Options) => {
  const queryClient = useQueryClient();
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
