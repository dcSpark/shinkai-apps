import { z } from 'zod';

export const editAgentSchema = z.object({
  agentName: z.string().optional(),
  externalUrl: z.string().url(),
  apikey: z.string(),
  modelCustom: z.string(),
  modelTypeCustom: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
});

export type EditAgentFormSchema = z.infer<typeof editAgentSchema>;
