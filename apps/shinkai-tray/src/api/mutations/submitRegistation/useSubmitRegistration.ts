import type { UseMutationOptions } from "@tanstack/react-query";

import { useMutation } from "@tanstack/react-query";

import { SetupDataArgs, submitRegistration } from ".";

type Options = UseMutationOptions<boolean, Error, SetupDataArgs>;

export const useSubmitRegistration = (options?: Options) => {
  return useMutation({
    mutationFn: submitRegistration,
    ...options,
  });
};
