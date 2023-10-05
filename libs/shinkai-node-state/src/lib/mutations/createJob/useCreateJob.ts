import type { UseMutationOptions } from "@tanstack/react-query";

import { useMutation } from "@tanstack/react-query";

import { createJob } from ".";
import { CreateJobInput, CreateJobOutput } from "./types";

type Options = UseMutationOptions<CreateJobOutput, Error, CreateJobInput>;

export const useCreateJob = (options?: Options) => {
  return useMutation({
    mutationFn: createJob,
    ...options,
  });
};
