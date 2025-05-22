import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { APIError } from '../../types';
import {
  initialRegistration,
  InitialRegistrationInput,
  InitialRegistrationOutput,
} from './index';

type Options = UseMutationOptions<
  InitialRegistrationOutput,
  APIError,
  InitialRegistrationInput
>;
export const useInitialRegistration = (options: Options) => {
  return useMutation({
    mutationFn: initialRegistration,
    ...options,
  });
};
