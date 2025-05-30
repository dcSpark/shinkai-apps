import  { type UseMutationOptions, useMutation  } from '@tanstack/react-query';

import { type APIError } from '../../types';
import {
  initialRegistration,
  type InitialRegistrationInput,
  type InitialRegistrationOutput,
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
