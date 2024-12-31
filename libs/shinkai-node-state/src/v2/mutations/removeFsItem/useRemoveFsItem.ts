import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { removeFsItem } from './index';
import { RemoveFsItemInput, RemoveFsItemOutput } from './types';

type Options = UseMutationOptions<RemoveFsItemOutput, Error, RemoveFsItemInput>;

export const useRemoveFsItem = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeFsItem,
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
