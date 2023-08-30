import { z } from 'zod';

export const updateInboxNameFormSchema = z.object({
  name: z.string().min(6),
});

export type UpdateInboxNameFormSchema = z.infer<
  typeof updateInboxNameFormSchema
>;
