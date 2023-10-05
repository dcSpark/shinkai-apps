import { useQuery } from "@tanstack/react-query";

import type { GetAgentsInput } from "./types";

import { getAgents } from ".";
import { FunctionKey } from "../../constants";

export const useAgents = (input: GetAgentsInput) => {
  const response = useQuery({
    queryKey: [FunctionKey.GET_AGENTS, input],
    queryFn: () => getAgents(input),
  });
  return { ...response, agents: response.data ?? [] };
};
