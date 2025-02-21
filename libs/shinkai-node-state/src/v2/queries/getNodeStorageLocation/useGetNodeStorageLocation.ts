import { useQuery } from "@tanstack/react-query";

import { getNodeStorageLocation } from ".";
import { GetNodeStorageLocationInput } from "./types";

export const useGetNodeStorageLocation = ({
  nodeAddress,
  token,
}: GetNodeStorageLocationInput) => {
  return useQuery({
    queryKey: ["nodeStorageLocation", nodeAddress, token],
    queryFn: () => getNodeStorageLocation({ nodeAddress, token }),
  });
};
