import { useMutation } from "@tanstack/react-query";

import { duplicateTool } from ".";

export const useDuplicateTool = ({
  toolKey,
  nodeAddress,
  token,
}: {
  toolKey: string;
  nodeAddress: string;
  token: string;
}) => {
  return useMutation({
    mutationFn: () => duplicateTool({ toolKey, nodeAddress, token }),
  });
};
