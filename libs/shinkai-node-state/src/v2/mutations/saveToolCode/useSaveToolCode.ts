import {
  useMutation,
  type UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getPlaygroundTool } from '../../queries/getPlaygroundTool';
import { APIError } from '../../types';
import { saveToolCode } from '.';
import { SaveToolCodeInput, SaveToolCodeOutput } from './types';

type Options = UseMutationOptions<
  SaveToolCodeOutput,
  APIError,
  SaveToolCodeInput
>;

export const useSaveToolCode = (options?: Options) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveToolCode,
    ...options,
    onSuccess: async (response, variables, context) => {
      if (!variables.shouldPrefetchPlaygroundTool) {
        queryClient.invalidateQueries({
          queryKey: [
            FunctionKeyV2.GET_PLAYGROUND_TOOL,
            {
              toolRouterKey: response.metadata.tool_router_key,
              token: variables.token,
              nodeAddress: variables.nodeAddress,
            },
          ],
        });
      }
      await queryClient.prefetchQuery({
        queryKey: [
          FunctionKeyV2.GET_PLAYGROUND_TOOL,
          {
            toolRouterKey: response.metadata.tool_router_key,
            token: variables.token,
            nodeAddress: variables.nodeAddress,
          },
        ],
        queryFn: () =>
          getPlaygroundTool({
            toolRouterKey: response.metadata.tool_router_key,
            token: variables.token,
            nodeAddress: variables.nodeAddress,
          }),
      });
      if (options?.onSuccess) {
        options.onSuccess(response, variables, context);
      }
    },
  });
};
