import { useQuery } from "@tanstack/react-query";

import { getInboxes } from ".";
import { FunctionKey } from "../../constants";
import { GetInboxesInput } from "./types";

export const useGetInboxes = (input: GetInboxesInput) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_INBOXES, input],
    queryFn: async () => getInboxes(input),
  });
  return {
    ...response,
    inboxIds: response.data ?? [],
  };
};
