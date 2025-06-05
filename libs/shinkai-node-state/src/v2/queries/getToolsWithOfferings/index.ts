import { getToolsWithOfferings as getToolsWithOfferingsApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';
import { type GetToolsWithOfferingsInput } from './types';

export const getToolsWithOfferings = async ({ nodeAddress, token }: GetToolsWithOfferingsInput) => {
  const response = await getToolsWithOfferingsApi(nodeAddress, token);
  return response;
};
