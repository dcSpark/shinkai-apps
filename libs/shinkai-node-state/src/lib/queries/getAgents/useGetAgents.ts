import { useQuery } from "@tanstack/react-query";

import { FunctionKey } from "../../constants";
import { getAgents } from ".";
import type { GetAgentsInput } from "./types";

export const useAgents = (input: GetAgentsInput) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_AGENTS, input],
    queryFn: () => getAgents(input),
  });
  return { ...response, agents: response.data ?? [] };
};
