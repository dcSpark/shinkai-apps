import { setToolMcpEnabled } from '@shinkai_network/shinkai-message-ts/api/tools/index';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

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
  return useMutation({
    mutationFn: (params: UseSetToolMcpEnabledInput) => {
      return setToolMcpEnabled(
        params.nodeAddress,
        params.token,
        params.toolRouterKey,
        params.mcpEnabled,
      );
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
