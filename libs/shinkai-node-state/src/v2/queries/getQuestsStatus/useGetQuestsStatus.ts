import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { type GetQuestsStatusInput, type GetQuestsStatusOutput } from './types';
import { getQuestsStatus } from './index';

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
