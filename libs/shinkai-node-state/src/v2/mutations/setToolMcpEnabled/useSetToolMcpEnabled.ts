import { setToolMcpEnabled } from '@shinkai_network/shinkai-message-ts/api/tools/index';
import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { FunctionKeyV2 } from '../../constants';

type UseSetToolMcpEnabledInput = {
  nodeAddress: string;
  token: string;
  toolRouterKey: string;
  mcpEnabled: boolean;
};

export const useSetToolMcpEnabled = (options?: {
  onSuccess?: (
    data: any,
    variables: UseSetToolMcpEnabledInput,
    context: unknown,
  ) => void;
  onError?: (
    error: AxiosError,
    variables: UseSetToolMcpEnabledInput,
    context: unknown,
  ) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: UseSetToolMcpEnabledInput) => {
      return setToolMcpEnabled(
        params.nodeAddress,
        params.token,
        params.toolRouterKey,
        params.mcpEnabled,
      );
    },
    onSuccess: (response, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_LIST_TOOLS],
      });

      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_SEARCH_TOOLS],
      });

      queryClient.invalidateQueries({
        queryKey: [
          FunctionKeyV2.GET_TOOL,
          {
            toolKey: variables.toolRouterKey,
          },
        ],
      });

      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
    onError: options?.onError,
  });
};
