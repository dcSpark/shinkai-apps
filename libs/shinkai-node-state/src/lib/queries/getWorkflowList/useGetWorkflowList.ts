import { QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';
import { getWorkflowList } from './index';
import { GetWorkflowListInput, GetWorkflowListOutput } from './types';

export type UseGetWorkflowList = [
  FunctionKey.GET_LIST_WORKFLOW,
  GetWorkflowListInput,
];

type Options = QueryObserverOptions<
  GetWorkflowListOutput,
  Error,
  GetWorkflowListOutput,
  GetWorkflowListOutput,
  UseGetWorkflowList
>;

export const useGetWorkflowList = (
  input: GetWorkflowListInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_LIST_WORKFLOW, input],
    queryFn: () => getWorkflowList(input),
    ...options,
  });
  return response;
};
