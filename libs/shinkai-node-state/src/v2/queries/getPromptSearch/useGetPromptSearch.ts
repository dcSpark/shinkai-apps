import { QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { getPromptSearch } from './index';
import { GetPromptSearchInput, GetPromptSearchOutput } from './types';

export type UseGetPromptSearch = [
  FunctionKeyV2.GET_SEARCH_PROMPT,
  GetPromptSearchInput,
];

type Options = QueryObserverOptions<
  GetPromptSearchOutput,
  APIError,
  GetPromptSearchOutput,
  GetPromptSearchOutput,
  UseGetPromptSearch
>;

export const useGetPromptSearch = (
  input: GetPromptSearchInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_SEARCH_PROMPT, input],
    queryFn: () => getPromptSearch(input),
    ...options,
  });
  return response;
};
