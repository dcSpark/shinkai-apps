import { getNodeStorageLocation as getNodeStorageLocationApi } from "@shinkai_network/shinkai-message-ts/api/general/index";

import { GetNodeStorageLocationInput } from "./types";

export const getNodeStorageLocation = async ({
  nodeAddress,
  token,
}: GetNodeStorageLocationInput) => {
  const storageLocation = await getNodeStorageLocationApi(nodeAddress, token);
  return storageLocation.storage_location;
};
