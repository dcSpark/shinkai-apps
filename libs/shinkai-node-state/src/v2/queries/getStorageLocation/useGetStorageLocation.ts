import { useQuery } from "@tanstack/react-query";

import { getStorageLocation } from ".";
import { GetStorageLocationInput } from "./types";

export const useGetStorageLocation = (input: GetStorageLocationInput) => {
  const { nodeAddress, token } = input;
  const response = useQuery({
    queryKey: ['getStorageLocation', nodeAddress, token],
    queryFn: () => getStorageLocation(nodeAddress, token),
  });
  return response;
};
