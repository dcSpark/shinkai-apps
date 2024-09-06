import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { payInvoice } from './index';
import { PayInvoiceInput, PayInvoiceOutput } from './types';

type Options = UseMutationOptions<PayInvoiceOutput, Error, PayInvoiceInput>;

export const usePayInvoice = (options?: Options) => {
  return useMutation({
    mutationFn: payInvoice,
    ...options,
  });
};
