import { z } from 'zod';

export const shareFolderFormSchema = z.object({
  folderDescription: z.string().min(1, 'Folder description is required'),
});

export type ShareFolderFormSchema = z.infer<typeof shareFolderFormSchema>;
