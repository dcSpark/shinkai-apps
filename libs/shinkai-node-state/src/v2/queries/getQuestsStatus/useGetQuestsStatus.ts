import { QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { getQuestsStatus } from './index';
import { GetQuestsStatusInput, GetQuestsStatusOutput } from './types';

export type UseGetQuestsStatus = [
  FunctionKeyV2.GET_QUESTS_STATUS,
  GetQuestsStatusInput,
];

type Options = QueryObserverOptions<
  GetQuestsStatusOutput,
  Error,
  GetQuestsStatusOutput,
  GetQuestsStatusOutput,
  UseGetQuestsStatus
>;

export const useGetQuestsStatus = (
  input: GetQuestsStatusInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  const response = useQuery({
    queryKey: [FunctionKeyV2.GET_QUESTS_STATUS, input],
    queryFn: () => getQuestsStatus(input),
    ...options,
  });
  return response;
};
