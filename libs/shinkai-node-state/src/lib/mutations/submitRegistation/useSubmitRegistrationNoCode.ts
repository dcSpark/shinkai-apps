import { submitInitialRegistrationNoCode } from '@shinkai_network/shinkai-message-ts/api';
import type { SubmitInitialRegistrationNoCodePayload } from '@shinkai_network/shinkai-message-ts/models';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

export const useSubmitRegistrationNoCode = (
  options: UseMutationOptions<
    Awaited<ReturnType<typeof submitInitialRegistrationNoCode>>,
    Error,
    SubmitInitialRegistrationNoCodePayload
  >,
) => {
  return useMutation({
    mutationFn: (payload) => {
      return submitInitialRegistrationNoCode(payload);
    },
    ...options,
  });
};
