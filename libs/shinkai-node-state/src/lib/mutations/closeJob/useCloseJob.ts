import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";

import { closeJob } from ".";
import { CloseJobInput, CloseJobOutput } from "./types";

type Options = UseMutationOptions<CloseJobOutput, Error, CloseJobInput>;

export const useCloseJob = (options?: Options) => {
  return useMutation({
    mutationFn: closeJob,
    ...options,
  });
};
