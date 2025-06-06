import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type APIError } from '../../types';
import { type GetPromptListInput, type GetPromptListOutput } from './types';
import { getPromptList } from './index';

export type UseGetPromptList = [
  FunctionKeyV2.GET_LIST_PROMPTS,
  GetPromptListInput,
];

type Options = QueryObserverOptions<
  GetPromptListOutput,
  APIError,
  GetPromptListOutput,
  GetPromptListOutput,
  UseGetPromptList
>;

export const useGetPromptList = (
  input: GetPromptListInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_LIST_PROMPTS, input],
    queryFn: () => getPromptList(input),
    select: (data) => data?.sort((a, b) => a.name.localeCompare(b.name)),
    ...options,
  });
  return response;
};
