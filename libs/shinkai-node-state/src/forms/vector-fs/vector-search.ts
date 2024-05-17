import { z } from 'zod';

export const searchVectorFormSchema = z.object({
  searchQuery: z.string().min(1, 'Search query is required'),
});

export type SearchVectorFormSchema = z.infer<typeof searchVectorFormSchema>;
