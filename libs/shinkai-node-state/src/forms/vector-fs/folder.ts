import { z } from 'zod';

export const shareFolderFormSchema = z.object({
  folderDescription: z.string().min(1, 'Folder description is required'),
});

export type ShareFolderFormSchema = z.infer<typeof shareFolderFormSchema>;

export const createFolderFormSchema = z.object({
  name: z.string().min(1, 'Folder name is required'),
});

export type CreateFolderFormSchema = z.infer<typeof createFolderFormSchema>;

export const uploadVRFilesFormSchema = z.object({
  files: z.array(z.any()).min(1),
});

export type UploadVRFilesFormSchema = z.infer<typeof uploadVRFilesFormSchema>;

export const saveWebpageToVectorFsFormSchema = z.object({
  files: z.array(z.any()).min(1),
  destinationFolderPath: z.string().min(1),
});

export type SaveWebpageToVectorFsFormSchema = z.infer<
  typeof saveWebpageToVectorFsFormSchema
>;
