import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { copyFsItem } from './index';
import { CopyVRItemInput, CopyVRItemOutput } from './types';

type Options = UseMutationOptions<CopyVRItemOutput, Error, CopyVRItemInput>;

export const useCopyFsItem = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: copyFsItem,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_VR_FILES],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
