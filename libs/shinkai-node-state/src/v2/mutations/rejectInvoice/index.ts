import { rejectInvoice as rejectInvoiceApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { type RejectInvoiceInput } from './types';

export const rejectInvoice = async ({
  nodeAddress,
  token,
  payload,
}: RejectInvoiceInput) => {
  const response = await rejectInvoiceApi(nodeAddress, token, payload);
  return response;
};
