import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

import { updateInboxName } from ".";
import type { UpdateInboxNamebInput,UpdateInboxNameOutput } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Options = UseMutationOptions<UpdateInboxNameOutput, Error, UpdateInboxNamebInput>;

export const useUpdateInboxName = (options?: Options) => {
  return useMutation({
    mutationFn: updateInboxName,
    ...options,
  });
};
