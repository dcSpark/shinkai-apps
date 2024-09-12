import { z } from 'zod';

export const chatMessageFormSchema = z.object({
  message: z.string().min(1),
  files: z.array(z.any()).max(3).optional(),
});

export type ChatMessageFormSchema = z.infer<typeof chatMessageFormSchema>;
