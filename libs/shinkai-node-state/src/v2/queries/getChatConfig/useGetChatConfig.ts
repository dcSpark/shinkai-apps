import { QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getChatConfig } from './index';
import { GetChatConfigInput, GetChatConfigOutput } from './types';

export type UseGetChatConfig = [
  FunctionKeyV2.GET_CHAT_CONFIG,
  GetChatConfigInput,
];
const DEFAULT_CHAT_CONFIG = {
  temperature: 0.8,
  seed: -1,
  top_k: 40,
  top_p: 0.9,
  stream: true,
} as const;

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
    select: (data) => {
      return {
        custom_prompt: data.custom_prompt,
        temperature: data.temperature ?? DEFAULT_CHAT_CONFIG.temperature,
        seed: data.seed ?? DEFAULT_CHAT_CONFIG.seed,
        top_k: data.top_k ?? DEFAULT_CHAT_CONFIG.top_k,
        top_p: data.top_p ?? DEFAULT_CHAT_CONFIG.top_p,
        stream: data.stream ?? DEFAULT_CHAT_CONFIG.stream,
      };
    },
    ...options,
  });
  return response;
};
