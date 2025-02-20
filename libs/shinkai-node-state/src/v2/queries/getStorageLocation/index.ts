import { getNodeStorageLocation } from '@shinkai_network/shinkai-message-ts/api/general/index';

export const getStorageLocation = async (nodeAddress: string, token: string) => {
  const response = await getNodeStorageLocation(nodeAddress, token);
  return response?.storage_location;
};
