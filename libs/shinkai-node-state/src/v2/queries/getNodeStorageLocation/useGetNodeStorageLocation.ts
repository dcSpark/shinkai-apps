import { useQuery } from "@tanstack/react-query";

import { FunctionKey } from "../../../lib/constants";
import { getNodeStorageLocation } from ".";
import { GetNodeStorageLocationInput } from "./types";

export const useGetNodeStorageLocation = (input: GetNodeStorageLocationInput) => {
  return useQuery({
    queryKey: [FunctionKey.GET_NODE_STORAGE_LOCATION, input],
    queryFn: () => getNodeStorageLocation(input),
  });
};
