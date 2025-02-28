import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { copyToolAssets } from './index';
import { CopyToolAssetsInput, CopyToolAssetsOutput } from './types';

type Options = UseMutationOptions<
  CopyToolAssetsOutput,
  APIError,
  CopyToolAssetsInput
>;

export const useCopyToolAssets = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: copyToolAssets,
    ...options,
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [
          FunctionKeyV2.GET_ALL_TOOL_ASSETS,
          {
            nodeAddress: variables.nodeAddress,
            token: variables.token,
            xShinkaiAppId: variables.xShinkaiAppId,
          },
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          FunctionKeyV2.GET_TOOL,
          {
            toolKey: variables.currentToolKeyPath,
          },
        ],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
