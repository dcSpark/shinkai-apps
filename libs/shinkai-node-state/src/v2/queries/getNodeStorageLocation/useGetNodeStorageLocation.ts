import { useQuery } from "@tanstack/react-query";

import { FunctionKeyV2 } from '../../constants';
import { getNodeStorageLocation } from ".";
import { GetNodeStorageLocationInput } from "./types";

export const useGetNodeStorageLocation = (input: GetNodeStorageLocationInput) => {
  return useQuery({
    queryKey: [FunctionKeyV2.GET_NODE_STORAGE_LOCATION, input],
    queryFn: () => getNodeStorageLocation(input),
  });
};
