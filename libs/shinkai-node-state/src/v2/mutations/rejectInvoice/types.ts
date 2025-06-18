import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type RejectInvoiceRequest } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type RejectInvoiceOutput = any;

export type RejectInvoiceInput = Token & {
  nodeAddress: string;
  payload: RejectInvoiceRequest;
};
