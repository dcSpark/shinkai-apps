import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { updateMcpServer } from './index';
import { UpdateMcpServerInput, UpdateMcpServerResponse } from './types';

export const useUpdateMcpServer = (
  options?: UseMutationOptions<UpdateMcpServerResponse, Error, UpdateMcpServerInput>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateMcpServerInput) => updateMcpServer(input),
    ...options,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_MCP_SERVERS],
      });
      await queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_MCP_SERVER_TOOLS, data.id],
      });
      if (options?.onSuccess) {
        await options.onSuccess(data, variables, context);
      }
    },
  });
};
