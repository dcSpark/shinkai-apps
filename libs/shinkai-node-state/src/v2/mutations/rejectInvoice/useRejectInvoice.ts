import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { type RejectInvoiceInput, type RejectInvoiceOutput } from './types';
import { rejectInvoice } from '.';

type Options = UseMutationOptions<RejectInvoiceOutput, Error, RejectInvoiceInput>;

export const useRejectInvoice = (options?: Options) => {
  return useMutation({
    mutationFn: rejectInvoice,
    ...options,
  });
};
