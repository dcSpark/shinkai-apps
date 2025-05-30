import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { type PayInvoiceInput, type PayInvoiceOutput } from './types';
import { payInvoice } from './index';

type Options = UseMutationOptions<PayInvoiceOutput, Error, PayInvoiceInput>;

export const usePayInvoice = (options?: Options) => {
  return useMutation({
    mutationFn: payInvoice,
    ...options,
  });
};
