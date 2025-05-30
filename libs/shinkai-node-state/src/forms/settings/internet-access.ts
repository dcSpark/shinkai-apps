import { z } from "zod";

export const internetAccessSchema = z.object({
  authtoken: z.string().optional(),
});

export type InternetAccessFormSchema = z.infer<typeof internetAccessSchema>;