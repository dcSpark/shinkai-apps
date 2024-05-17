import { z } from 'zod';

export const createJobFormSchema = z.object({
  agent: z.string().min(1),
  content: z.string().min(1),
  files: z.array(z.any()).max(3),
});

export type CreateJobFormSchema = z.infer<typeof createJobFormSchema>;
