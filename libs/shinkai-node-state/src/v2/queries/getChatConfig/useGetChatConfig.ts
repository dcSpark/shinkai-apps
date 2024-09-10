import { QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getChatConfig } from './index';
import { GetChatConfigInput, GetChatConfigOutput } from './types';

export type UseGetChatConfig = [
  FunctionKeyV2.GET_CHAT_CONFIG,
  GetChatConfigInput,
];

type Options = QueryObserverOptions<
  GetChatConfigOutput,
  Error,
  GetChatConfigOutput,
  GetChatConfigOutput,
  UseGetChatConfig
>;

export const useGetChatConfig = (
  input: GetChatConfigInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_CHAT_CONFIG, input],
    queryFn: () => getChatConfig(input),
    ...options,
  });
  return response;
};
