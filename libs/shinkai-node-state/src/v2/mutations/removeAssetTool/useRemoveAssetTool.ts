import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { removeToolAsset } from '.';
import { RemoveAssetToToolInput, RemoveAssetToToolOutput } from './types';

type Options = UseMutationOptions<
  RemoveAssetToToolOutput,
  APIError,
  RemoveAssetToToolInput
>;

export const useRemoveAssetTool = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeToolAsset,
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
