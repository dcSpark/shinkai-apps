import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { APIError } from '../../types';
import { submitFeedback } from './index';
import { SubmitFeedbackInput, SubmitFeedbackOutput } from './types';

type Options = UseMutationOptions<
  SubmitFeedbackOutput,
  APIError,
  SubmitFeedbackInput
>;

export const useSubmitFeedback = (options?: Options) => {
  return useMutation({
    mutationFn: submitFeedback,
    ...options,
  });
};
