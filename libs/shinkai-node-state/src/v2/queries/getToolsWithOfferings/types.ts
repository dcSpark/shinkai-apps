import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type GetToolsWithOfferingsResponse } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type GetToolsWithOfferingsInput = Token & {
  nodeAddress: string;
};

export type GetToolsWithOfferingsOutput = GetToolsWithOfferingsResponse;
