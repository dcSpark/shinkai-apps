import type {
  APIUseRegistrationCodeSuccessResponse,
  SubmitInitialRegistrationNoCodePayload,
} from '@shinkai_network/shinkai-message-ts/models';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { submitRegistrationNoCode } from '.';

type Data = {
  success: boolean;
  data?: APIUseRegistrationCodeSuccessResponse | undefined;
};
type Options = UseMutationOptions<Data, Error, SubmitInitialRegistrationNoCodePayload>;

export const useSubmitRegistrationNoCode = (options?: Options) => {
  return useMutation({
    mutationFn: submitRegistrationNoCode,
    ...options,
  });
};
