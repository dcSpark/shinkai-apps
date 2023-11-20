import type { APIUseRegistrationCodeSuccessResponse } from "@shinkai_network/shinkai-message-ts/models";
import type { UseMutationOptions } from "@tanstack/react-query";

import { useMutation } from "@tanstack/react-query";

import { SetupDataArgs, submitRegistrationNoCode } from ".";

type Data = {
  success: boolean;
  data?: APIUseRegistrationCodeSuccessResponse | undefined;
};
type Options = UseMutationOptions<Data, Error, SetupDataArgs>;

export const useSubmitRegistrationNoCode = (options?: Options) => {
  return useMutation({
    mutationFn: submitRegistrationNoCode,
    ...options,
  });
};
