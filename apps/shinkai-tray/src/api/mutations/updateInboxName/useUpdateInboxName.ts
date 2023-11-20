import type { UseMutationOptions } from "@tanstack/react-query";

import { useMutation } from "@tanstack/react-query";

import type { UpdateInboxNameInput, UpdateInboxNameOutput } from "./types";

import { updateInboxName } from ".";
import { FunctionKey, queryClient } from "../../constants";

type Options = UseMutationOptions<UpdateInboxNameOutput, Error, UpdateInboxNameInput>;

export const useUpdateInboxName = (options?: Options) => {
  return useMutation({
    mutationFn: updateInboxName,
    onSuccess: (...onSuccessParameters) => {
      queryClient.invalidateQueries({ queryKey: [FunctionKey.GET_INBOXES] });
      if (options?.onSuccess) {
        options.onSuccess(...onSuccessParameters);
      }
    },
  });
};
