import { z } from 'zod';

export const quickConnectFormSchema = z.object({
  node_address: z.string().url({
    message: 'Node Address must be a valid URL',
  }),
});

export type QuickConnectFormSchema = z.infer<typeof quickConnectFormSchema>;
