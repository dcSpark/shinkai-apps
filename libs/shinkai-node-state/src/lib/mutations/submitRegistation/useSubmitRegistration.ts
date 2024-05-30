import { SetupPayload } from '@shinkai_network/shinkai-message-ts/models';
import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { submitRegistration } from '.';

type Options = UseMutationOptions<
  Awaited<ReturnType<typeof submitRegistration>>,
  Error,
  SetupPayload
>;

export const useSubmitRegistration = (options?: Options) => {
  return useMutation({
    mutationFn: submitRegistration,
    ...options,
  });
};
