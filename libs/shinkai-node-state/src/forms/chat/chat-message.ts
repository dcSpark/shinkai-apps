import { z } from 'zod';

export const chatMessageFormSchema = z.object({
  message: z.string().min(1),
  file: z.any().optional(),
});

export type ChatMessageFormSchema = z.infer<typeof chatMessageFormSchema>;
