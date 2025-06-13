import { type NetworkToolWithOffering } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type FormattedNetworkAgent = {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  provider: string;
  toolRouterKey: string;
  apiData: NetworkToolWithOffering;
};
