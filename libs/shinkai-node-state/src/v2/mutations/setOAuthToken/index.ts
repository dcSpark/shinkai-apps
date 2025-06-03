import { setOAuthToken } from '@shinkai_network/shinkai-message-ts/api/tools/index';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { type APIError } from '../../types';

export type SetOAuthTokenInput = {
  nodeAddress: string;
  token: string;
  state: string;
  code: string;
};

export type SetOAuthTokenOutput = {
  state: string;
  code: string;
};

type Options = UseMutationOptions<
  SetOAuthTokenOutput,
  APIError,
  SetOAuthTokenInput
>;

export const useSetOAuthToken = (options?: Options) => {
  return useMutation({
    mutationFn: async (variables) => {
      const { nodeAddress, token, state, code } = variables;
      await setOAuthToken(nodeAddress, token, {
        code,
        state,
      });
      return { code, state };
    },
    ...options,
  });
};
