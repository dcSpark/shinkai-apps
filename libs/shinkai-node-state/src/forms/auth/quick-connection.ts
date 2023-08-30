import { z } from 'zod';

export const quickConnectFormSchema = z.object({
  registration_name: z.string().min(5),
  node_address: z.string().url({
    message: 'Node Address must be a valid URL',
  }),
  shinkai_identity: z
    .string()
    .regex(
      /^@@[a-zA-Z0-9_]+\.shinkai.*$/,
      `It should be in the format of @@<name>.shinkai`,
    )
    .nullish(),
});

export type QuickConnectFormSchema = z.infer<typeof quickConnectFormSchema>;
