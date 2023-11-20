import { isLocalMessage } from "@shinkai_network/shinkai-message-ts/utils";
import { useQuery } from "@tanstack/react-query";

import { getInboxes } from ".";
import { useAuth } from "../../../store/auth.ts";
import { FunctionKey } from "../../constants";
import { GetInboxesInput } from "./types";

export const useGetInboxes = (input: GetInboxesInput) => {
  const auth = useAuth((state) => state.auth);

  const response = useQuery({
    queryKey: [FunctionKey.GET_INBOXES, input],
    queryFn: async () => getInboxes(input),
    refetchIntervalInBackground: true,
    refetchInterval: ({ state }) => {
      const allInboxesAreCompleted = state.data?.every((inbox) => {
        return !isLocalMessage(
          inbox.last_message,
          auth?.shinkai_identity ?? "",
          auth?.profile ?? ""
        );
      });
      return allInboxesAreCompleted ? 0 : 3000;
    },
  });

  return {
    ...response,
    inboxes: response.data ?? [],
  };
};
