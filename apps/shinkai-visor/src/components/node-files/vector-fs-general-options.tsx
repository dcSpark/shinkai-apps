import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateVRFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/createVRFolder/useCreateVRFolder';
import { useUploadVRFiles } from '@shinkai_network/shinkai-node-state/lib/mutations/uploadVRFiles/useUploadVRFiles';
import {
  Button,
  DirectoryTypeIcon,
  DrawerHeader,
  DrawerTitle,
  FileItem,
  FileTypeIcon,
  FileUploader,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  TextField,
} from '@shinkai_network/shinkai-ui';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAuth } from '../../store/auth/auth';
import {
  FolderSelectionList,
  useVectorFolderSelectionStore,
} from './folder-selection-list';
import { useVectorFsStore } from './node-file-context';

const createFolderSchema = z.object({
  name: z.string(),
});
export const AddNewFolderAction = () => {
  const auth = useAuth((state) => state.auth);
  const currentGlobalPath = useVectorFsStore(
    (state) => state.currentGlobalPath,
  );
  const closeDrawerMenu = useVectorFsStore((state) => state.closeDrawerMenu);
  const createFolderForm = useForm<z.infer<typeof createFolderSchema>>({
    resolver: zodResolver(createFolderSchema),
  });

  const {
    isPending,
    mutateAsync: createVRFolder,
    isSuccess,
  } = useCreateVRFolder({
    onSuccess: () => {
      toast.success('Folder created successfully');
      createFolderForm.reset();
      closeDrawerMenu();
    },
    onError: () => {
      toast.error('Error creating folder');
    },
  });

  const onSubmit = async (values: z.infer<typeof createFolderSchema>) => {
    if (!auth) return;

    await createVRFolder({
      nodeAddress: auth?.node_address ?? '',
      profile: auth?.profile ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      folderName: values.name,
      path: currentGlobalPath,
      my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
      my_device_identity_sk: auth?.profile_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success('Folder created successfully');
      createFolderForm.reset();
    }
  }, [createFolderForm, isSuccess]);

  return (
    <>
      <DrawerHeader>
        <DrawerTitle className="flex flex-col items-start gap-1">
          <DirectoryTypeIcon className="h-10 w-10" />
          Add New Folder
        </DrawerTitle>
      </DrawerHeader>
      <Form {...createFolderForm}>
        <form
          className="space-y-8 pt-4"
          onSubmit={createFolderForm.handleSubmit(onSubmit)}
        >
          <FormField
            control={createFolderForm.control}
            name="name"
            render={({ field }) => (
              <TextField
                autoFocus
                field={{
                  ...field,
                  onKeyDown: (event) => {
                    if (
                      event.key === 'Enter' &&
                      (event.metaKey || event.ctrlKey)
                    ) {
                      createFolderForm.handleSubmit(onSubmit)();
                    }
                  },
                }}
                label="Folder Name"
              />
            )}
          />
          <Button
            className="w-full"
            disabled={isPending}
            isLoading={isPending}
            type="submit"
          >
            Create Folder
          </Button>
        </form>
      </Form>
    </>
  );
};
const uploadVRFilesSchema = z.object({
  files: z.array(z.any()).min(1),
});
export const UploadVRFilesAction = () => {
  const auth = useAuth((state) => state.auth);
  const closeDrawerMenu = useVectorFsStore((state) => state.closeDrawerMenu);
  const currentGlobalPath = useVectorFsStore(
    (state) => state.currentGlobalPath,
  );
  const createFolderForm = useForm<z.infer<typeof uploadVRFilesSchema>>({
    resolver: zodResolver(uploadVRFilesSchema),
  });

  const { isPending, mutateAsync: uploadVRFiles } = useUploadVRFiles({
    onSuccess: () => {
      toast.success('Files uploaded successfully', {
        id: 'uploading-VR-files',
        description: '',
      });
      createFolderForm.reset();
    },
    onError: () => {
      toast.error('Error uploading files', {
        id: 'uploading-VR-files',
        description: '',
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof uploadVRFilesSchema>) => {
    if (!auth) return;
    toast.loading('Uploading files', {
      id: 'uploading-VR-files',
      description: 'This process might take from 1-2 minutes per file.',
      position: 'bottom-left',
    });
    closeDrawerMenu();
    await uploadVRFiles({
      nodeAddress: auth?.node_address ?? '',
      sender: auth?.shinkai_identity ?? '',
      senderSubidentity: auth?.profile ?? '',
      receiver: auth?.shinkai_identity ?? '',
      destinationPath: currentGlobalPath,
      files: values.files,
      my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
      my_device_identity_sk: auth?.profile_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    });
  };

  return (
    <>
      <DrawerHeader>
        <DrawerTitle className="flex flex-col items-start gap-1">
          <FileTypeIcon className="h-10 w-10" />
          File Upload
        </DrawerTitle>
      </DrawerHeader>
      <Form {...createFolderForm}>
        <form
          className="space-y-8"
          onSubmit={createFolderForm.handleSubmit(onSubmit)}
        >
          <FormField
            control={createFolderForm.control}
            name="files"
            render={({ field }) => (
              <FormItem className="mt-3">
                <FormLabel className="sr-only">
                  <FormattedMessage id="file.one" />
                </FormLabel>
                <FormControl>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-center">
                      <FileUploader
                        allowMultiple
                        descriptionText="Supports pdf, md, txt"
                        onChange={(acceptedFiles) => {
                          field.onChange(acceptedFiles);
                        }}
                        value={field.value}
                      />
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="w-full"
            disabled={isPending}
            isLoading={isPending}
            type="submit"
          >
            Upload
          </Button>
        </form>
      </Form>
    </>
  );
};
const saveWebpageToVectorFsSchema = z.object({
  files: z.array(z.any()).min(1),
  destinationFolderPath: z.string().min(1),
});
export const SaveWebpageToVectorFsAction = () => {
  const location = useLocation<{ files: File[] }>();
  const auth = useAuth((state) => state.auth);
  const closeDrawerMenu = useVectorFsStore((state) => state.closeDrawerMenu);

  const destinationFolderPath = useVectorFolderSelectionStore(
    (state) => state.destinationFolderPath,
  );
  const setCurrentGlobalPath = useVectorFsStore(
    (state) => state.setCurrentGlobalPath,
  );
  const saveWebpageToVectorFsForm = useForm<
    z.infer<typeof saveWebpageToVectorFsSchema>
  >({
    resolver: zodResolver(saveWebpageToVectorFsSchema),
    defaultValues: {
      files: location?.state?.files || [],
    },
  });

  const { isPending, mutateAsync: uploadVRFiles } = useUploadVRFiles({
    onSuccess: () => {
      toast.success('Webpage saved to AI Files successfully', {
        id: 'uploading-VR-files-include-folder',
        description: '',
      });
      setCurrentGlobalPath(destinationFolderPath ?? '/');
      saveWebpageToVectorFsForm.reset();
    },
    onError: () => {
      toast.error('Error saving webpage to AI Files', {
        id: 'uploading-VR-files-include-folder',
        description: '',
      });
    },
  });

  const onSubmit = async (
    values: z.infer<typeof saveWebpageToVectorFsSchema>,
  ) => {
    if (destinationFolderPath === '/') {
      toast.error(
        "Please select another destination folder. You can't save files to the root folder.",
      );
      return;
    }
    if (!auth) return;
    toast.loading('Uploading files', {
      id: 'uploading-VR-files-include-folder',
      description: 'This process might take from 1-2 minutes per file.',
      position: 'bottom-left',
    });
    closeDrawerMenu();
    await uploadVRFiles({
      nodeAddress: auth?.node_address ?? '',
      sender: auth?.shinkai_identity ?? '',
      senderSubidentity: auth?.profile ?? '',
      receiver: auth?.shinkai_identity ?? '',
      destinationPath: values.destinationFolderPath,
      files: values.files,
      my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
      my_device_identity_sk: auth?.profile_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    });
  };

  useEffect(() => {
    saveWebpageToVectorFsForm.setValue(
      'destinationFolderPath',
      destinationFolderPath ?? '/',
    );
  }, [destinationFolderPath, saveWebpageToVectorFsForm]);

  return (
    <>
      <DrawerHeader>
        <DrawerTitle className="flex flex-col items-start gap-1">
          Save Webpage to VectorFS
        </DrawerTitle>
      </DrawerHeader>
      <Form {...saveWebpageToVectorFsForm}>
        <form
          className="mt-6 space-y-8"
          onSubmit={saveWebpageToVectorFsForm.handleSubmit(onSubmit)}
        >
          <FormField
            control={saveWebpageToVectorFsForm.control}
            name="files"
            render={({ field }) => (
              <div className="mt-3 space-y-2">
                <span>Selected File</span>
                <FormMessage />
                <FormControl>
                  <FileItem file={field.value?.[0]} />
                </FormControl>
              </div>
            )}
          />
          <FormField
            control={saveWebpageToVectorFsForm.control}
            name="destinationFolderPath"
            render={({ field }) => (
              <div className="mt-3 space-y-2">
                <span>Choose destination folder:</span>
                <div className="-mt-4 rounded-lg px-2">
                  <FolderSelectionList />
                </div>
                <FormMessage />
              </div>
            )}
          />

          <Button
            className="w-full"
            disabled={isPending}
            isLoading={isPending}
            type="submit"
          >
            Save
          </Button>
        </form>
      </Form>
    </>
  );
};
