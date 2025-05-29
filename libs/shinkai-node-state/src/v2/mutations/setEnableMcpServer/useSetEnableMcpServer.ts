import {
  MutationOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { setEnableMcpServer } from './index';
import { SetEnableMcpServerInput, SetEnableMcpServerOutput } from './types';

type Options = MutationOptions<
  SetEnableMcpServerOutput,
  Error,
  SetEnableMcpServerInput
>;

export const useSetEnableMcpServer = (options?: Options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SetEnableMcpServerInput) => setEnableMcpServer(input),
    ...options,
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_MCP_SERVERS],
      });

      if (options?.onSuccess) {
        options.onSuccess(data, variables, undefined);
      }
    },
  });
};