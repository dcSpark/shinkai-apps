import { z } from 'zod';

export const createJobFormSchema = z.object({
  agent: z.string().min(1),
  message: z.string().min(1),
  files: z.array(z.any()).max(3),
  workflow: z.string().optional(),
});

export type CreateJobFormSchema = z.infer<typeof createJobFormSchema>;

export const createJobPlaygroundFormSchema = createJobFormSchema
  .omit({ workflow: true })
  .merge(z.object({ workflow: z.string().min(1) }));
export type CreateJobPlaygroundFormSchema = z.infer<
  typeof createJobPlaygroundFormSchema
>;
