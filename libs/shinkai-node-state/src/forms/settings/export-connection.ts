import { z } from 'zod';

export const exportConnectionFormSchema = z
  .object({
    passphrase: z.string().min(8),
    confirmPassphrase: z.string().min(8),
  })
  .superRefine(({ passphrase, confirmPassphrase }, ctx) => {
    if (passphrase !== confirmPassphrase) {
      ctx.addIssue({
        code: 'custom',
        message: "Passphrases don't match",
        path: ['confirmPassphrase'],
      });
    }
  });

export type ExportConnectionFormSchema = z.infer<
  typeof exportConnectionFormSchema
>;
