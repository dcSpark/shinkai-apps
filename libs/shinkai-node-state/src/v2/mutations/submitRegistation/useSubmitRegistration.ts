import {
  SubmitRegistrationCodeRequest,
  SubmitRegistrationCodeResponse,
} from '@shinkai_network/shinkai-message-ts/api/general/types';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { submitRegistration } from '.';

type Options = UseMutationOptions<
  SubmitRegistrationCodeResponse,
  Error,
  SubmitRegistrationCodeRequest
>;

export const useSubmitRegistration = (options?: Options) => {
  return useMutation({
    mutationFn: submitRegistration,
    ...options,
  });
};
