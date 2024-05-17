import { z } from 'zod';

export const createDMFormSchema = z.object({
  receiverIdentity: z.string().min(1),
  message: z.string().min(1),
});

export type CreateDMFormSchema = z.infer<typeof createDMFormSchema>;
