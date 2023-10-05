import type { UseMutationOptions } from "@tanstack/react-query";

import { useMutation } from "@tanstack/react-query";

import { createAgent } from ".";
import { CreateAgentInput } from "./types";

type Options = UseMutationOptions<unknown, Error, CreateAgentInput>;

export const useCreateAgent = (options?: Options) => {
  return useMutation({
    mutationFn: createAgent,
    ...options,
  });
};
