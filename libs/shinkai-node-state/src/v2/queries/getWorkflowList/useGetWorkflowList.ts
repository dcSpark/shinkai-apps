import { QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { getWorkflowList } from './index';
import { GetWorkflowListInput, GetWorkflowListOutput } from './types';

export type UseGetWorkflowList = [
  FunctionKeyV2.GET_LIST_WORKFLOW,
  GetWorkflowListInput,
];

type Options = QueryObserverOptions<
  GetWorkflowListOutput,
  APIError,
  GetWorkflowListOutput,
  GetWorkflowListOutput,
  UseGetWorkflowList
>;

export const useGetWorkflowList = (
  input: GetWorkflowListInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_LIST_WORKFLOW, input],
    queryFn: () => getWorkflowList(input),
    ...options,
  });
  return response;
};
