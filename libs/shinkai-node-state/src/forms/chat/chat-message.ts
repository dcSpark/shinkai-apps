import { z } from 'zod';

export const chatMessageFormSchema = z.object({
  message: z.string().min(1),
  files: z.array(z.any()).max(3).optional(),
  tool: z
    .object({
      key: z.string().min(1),
      name: z.string().min(1),
      description: z.string().min(1),
      args: z.array(z.string()).optional(),
    })
    .optional(),
});

export const chatMessageFormSchemaWithOneFile = z.object({
  message: z.string().min(1),
  file: z.any().optional(),
});

export type ChatMessageFormSchema = z.infer<typeof chatMessageFormSchema>;
export type ChatMessageFormSchemaWithOneFile = z.infer<
  typeof chatMessageFormSchemaWithOneFile
>;
