import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import {
  PayInvoiceRequest,
  PayInvoiceResponse,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';

export type PayInvoiceOutput = PayInvoiceResponse;

export type PayInvoiceInput = Token & {
  nodeAddress: string;
  payload: PayInvoiceRequest;
};
