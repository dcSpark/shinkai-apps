import type { UseMutationOptions } from "@tanstack/react-query";

import { useMutation } from "@tanstack/react-query";

import { createRegistrationCode } from ".";
import { CreateRegistrationCodeInput, CreateRegistrationCodeOutput } from "./types";

type Options = UseMutationOptions<
  CreateRegistrationCodeOutput,
  Error,
  CreateRegistrationCodeInput
>;

export const useCreateRegistrationCode = (options?: Options) => {
  return useMutation({
    mutationFn: createRegistrationCode,
    ...options,
  });
};
