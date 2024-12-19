import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { uploadAssetsToTool } from '.';
import { UploadAssetsToToolInput, UploadAssetsToToolOutput } from './types';

type Options = UseMutationOptions<
  UploadAssetsToToolOutput,
  APIError,
  UploadAssetsToToolInput
>;

export const useUploadAssetsTool = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadAssetsToTool,
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
