import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { type APIError } from '../../types';
import { type SubmitFeedbackInput, type SubmitFeedbackOutput } from './types';
import { submitFeedback } from './index';

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
