import { type Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  type PayInvoiceRequest,
  type PayInvoiceResponse,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type PayInvoiceOutput = PayInvoiceResponse;

export type PayInvoiceInput = Token & {
  nodeAddress: string;
  payload: PayInvoiceRequest;
};
