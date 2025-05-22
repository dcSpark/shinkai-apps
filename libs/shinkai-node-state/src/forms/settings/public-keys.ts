import { z } from 'zod';

export const publicKeysSchema = z.object({
  node_encryption_pk: z.string().optional(),
  node_signature_pk: z.string().optional(),
  api_v2_key: z.string().optional(),
});

export type PublicKeysFormSchema = z.infer<typeof publicKeysSchema>;
