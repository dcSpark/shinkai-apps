import { payInvoice as payInvoiceApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { PayInvoiceInput } from './types';

export const payInvoice = async ({
  nodeAddress,
  token,
  payload,
}: PayInvoiceInput) => {
  const response = await payInvoiceApi(nodeAddress, token, payload);
  return response;
};
