import { z } from 'zod';

export const restoreConnectionFormSchema = z.object({
  passphrase: z.string().min(8),
  encryptedConnectionFile: z.array(z.any()).max(1),
});

export type RestoreConnectionFormSchema = z.infer<
  typeof restoreConnectionFormSchema
>;
