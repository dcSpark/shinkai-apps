import {
  SubmitRegistrationNoCodeRequest,
  SubmitRegistrationNoCodeResponse,
} from '@shinkai_network/shinkai-message-ts/api/general/types';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { APIError } from '../../types';
import { submitRegistrationNoCode } from './index';

type Options = UseMutationOptions<
  SubmitRegistrationNoCodeResponse,
  APIError,
  SubmitRegistrationNoCodeRequest
>;
export const useSubmitRegistrationNoCode = (options: Options) => {
  return useMutation({
    mutationFn: submitRegistrationNoCode,
    ...options,
  });
};
