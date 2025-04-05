import {
  MutationOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { setToolMcpEnabled } from './index';
import { SetToolMcpEnabledInput, SetToolMcpEnabledOutput } from './types';

type Options = MutationOptions<
  SetToolMcpEnabledOutput,
  Error,
  SetToolMcpEnabledInput
>;

export const useSetToolMcpEnabled = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SetToolMcpEnabledInput) => setToolMcpEnabled(input),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_LIST_TOOLS],
      });

      await queryClient.invalidateQueries({
        queryKey: [
          FunctionKeyV2.GET_TOOL,
          {
            nodeAddress: variables.nodeAddress,
            token: variables.token,
            toolKey: variables.toolRouterKey,
          },
        ],
      });

      if (options?.onSuccess) {
        options.onSuccess(_, variables, undefined);
      }
    },
    ...options,
  });
};
