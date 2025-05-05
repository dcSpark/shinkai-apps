import { z } from 'zod';

export const editAIModelSchema = z.object({
  name: z.string(),
  externalUrl: z.string().url(),
  apikey: z.string(),
  modelCustom: z.string(),
  modelTypeCustom: z.string(),
  description: z.string().optional(),
});

export type EditAIModelFormSchema = z.infer<typeof editAIModelSchema>;
