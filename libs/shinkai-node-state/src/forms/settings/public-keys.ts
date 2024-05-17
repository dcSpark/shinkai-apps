import { z } from 'zod';

export const publicKeysSchema = z.object({
  node_encryption_pk: z.string().optional(),
  node_signature_pk: z.string().optional(),
  profile_encryption_pk: z.string().optional(),
  profile_identity_pk: z.string().optional(),
  my_device_encryption_pk: z.string().optional(),
  my_device_identity_pk: z.string().optional(),
});

export type PublicKeysFormSchema = z.infer<typeof publicKeysSchema>;
