import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { updateQuestsStatus } from './index';
import { UpdateQuestsStatusInput, UpdateQuestsStatusOutput } from './types';

export type UseGetQuestsStatus = [
  FunctionKeyV2.GET_QUESTS_STATUS,
  UpdateQuestsStatusInput,
];

type Options = UseMutationOptions<
  UpdateQuestsStatusOutput,
  APIError,
  UpdateQuestsStatusInput
>;

export const useUpdateQuestsStatus = (
  options?: Omit<Options, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateQuestsStatus,
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [FunctionKeyV2.GET_QUESTS_STATUS, variables],
      });
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
  });
};
