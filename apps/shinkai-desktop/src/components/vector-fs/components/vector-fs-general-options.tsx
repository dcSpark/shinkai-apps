import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  CreateFolderFormSchema,
  createFolderFormSchema,
  CreateTextFileFormSchema,
  createTextFileFormSchema,
  SaveWebpageToVectorFsFormSchema,
  saveWebpageToVectorFsFormSchema,
  UploadVRFilesFormSchema,
  uploadVRFilesFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/vector-fs/folder';
import { useCreateFolder } from '@shinkai_network/shinkai-node-state/v2/mutations/createFolder/useCreateFolder';
import { useUploadVRFiles } from '@shinkai_network/shinkai-node-state/v2/mutations/uploadVRFiles/useUploadVRFiles';
import {
  Button,
  FileItem,
  FileUploader,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  TextField,
} from '@shinkai_network/shinkai-ui';
import {
  DirectoryTypeIcon,
  FileTypeIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { FileType2Icon } from 'lucide-react';
import { PrismEditor } from 'prism-react-editor';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';

import { useAnalytics } from '../../../lib/posthog-provider';
import { useAuth } from '../../../store/auth';
import ToolCodeEditor from '../../playground-tool/tool-code-editor';
import { useVectorFsStore } from '../context/vector-fs-context';
import {
  FolderSelectionList,
  useVectorFolderSelectionStore,
} from './folder-selection-list';

export const AddNewFolderAction = () => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const currentGlobalPath = useVectorFsStore(
    (state) => state.currentGlobalPath,
  );
  const closeDrawerMenu = useVectorFsStore((state) => state.closeDrawerMenu);
  const createFolderForm = useForm<CreateFolderFormSchema>({
    resolver: zodResolver(createFolderFormSchema),
  });

  const {
    isPending,
    mutateAsync: createVRFolder,
    isSuccess,
  } = useCreateFolder({
    onSuccess: () => {
      createFolderForm.reset();
      closeDrawerMenu();
    },
    onError: () => {
      toast.error(t('vectorFs.errors.folderCreated'));
    },
  });

  const onSubmit = async (values: CreateFolderFormSchema) => {
    if (!auth) return;

    await createVRFolder({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      folderName: values.name,
      path: currentGlobalPath,
    });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(t('vectorFs.success.folderCreated'));
      createFolderForm.reset();
    }
  }, [createFolderForm, isSuccess]);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex flex-col items-start gap-1">
          <DirectoryTypeIcon className="h-10 w-10" />
          {t('vectorFs.actions.createFolder')}
        </SheetTitle>
      </SheetHeader>
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
                label={t('vectorFs.forms.folderName')}
              />
            )}
          />
          <Button
            className="w-full"
            disabled={isPending}
            isLoading={isPending}
            type="submit"
          >
            {t('vectorFs.actions.createFolder')}
          </Button>
        </form>
      </Form>
    </>
  );
};
export const UploadVRFilesAction = () => {
  const { t } = useTranslation();

  const { captureAnalyticEvent } = useAnalytics();

  const auth = useAuth((state) => state.auth);
  const closeDrawerMenu = useVectorFsStore((state) => state.closeDrawerMenu);
  const currentGlobalPath = useVectorFsStore(
    (state) => state.currentGlobalPath,
  );
  const createFolderForm = useForm<UploadVRFilesFormSchema>({
    resolver: zodResolver(uploadVRFilesFormSchema),
  });

  const { isPending, mutateAsync: uploadVRFiles } = useUploadVRFiles({
    onSuccess: (_, variables) => {
      captureAnalyticEvent('Upload Files', {
        filesCount: variables.files.length,
      });
      toast.success(t('vectorFs.success.filesUploaded'), {
        id: 'uploading-VR-files',
        description: '',
      });
      createFolderForm.reset();
    },
    onError: (error) => {
      toast.error(t('vectorFs.errors.filesUploaded'), {
        id: 'uploading-VR-files',
        description: error.message,
      });
    },
  });

  const onSubmit = async (values: UploadVRFilesFormSchema) => {
    if (!auth) return;
    toast.loading(t('vectorFs.pending.filesUploading'), {
      id: 'uploading-VR-files',
      description: 'This process might take from 1-2 minutes per file.',
      position: 'bottom-left',
    });
    closeDrawerMenu();
    await uploadVRFiles({
      nodeAddress: auth?.node_address ?? '',
      destinationPath: currentGlobalPath,
      files: values.files,
      token: auth?.api_v2_key ?? '',
    });
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex flex-col items-start gap-1">
          <FileTypeIcon className="h-10 w-10" />
          {t('vectorFs.actions.uploadFile')}
        </SheetTitle>
        <SheetDescription>
          {t('vectorFs.actions.uploadFileText')}
        </SheetDescription>
      </SheetHeader>
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
                <FormLabel className="sr-only">File</FormLabel>
                <FormControl>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-center">
                      <FileUploader
                        allowMultiple
                        descriptionText={t('common.uploadAFileDescription')}
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
            {t('common.upload')}
          </Button>
        </form>
      </Form>
    </>
  );
};
export const SaveWebpageToVectorFsAction = () => {
  // const location = useLocation<{ files: File[] }>();
  const location = useLocation();
  const auth = useAuth((state) => state.auth);
  const closeDrawerMenu = useVectorFsStore((state) => state.closeDrawerMenu);

  const destinationFolderPath = useVectorFolderSelectionStore(
    (state) => state.destinationFolderPath,
  );
  const setCurrentGlobalPath = useVectorFsStore(
    (state) => state.setCurrentGlobalPath,
  );
  const saveWebpageToVectorFsForm = useForm<SaveWebpageToVectorFsFormSchema>({
    resolver: zodResolver(saveWebpageToVectorFsFormSchema),
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

  const onSubmit = async (values: SaveWebpageToVectorFsFormSchema) => {
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
      destinationPath: values.destinationFolderPath,
      files: values.files,
      token: auth?.api_v2_key ?? '',
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
      <SheetHeader>
        <SheetTitle className="flex flex-col items-start gap-1">
          Save Webpage to AI Files
        </SheetTitle>
      </SheetHeader>
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
            render={() => (
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

// create a new text file
export const CreateTextFileAction = () => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const currentGlobalPath = useVectorFsStore(
    (state) => state.currentGlobalPath,
  );

  const textFileContentRef = useRef<PrismEditor | null>(null);

  const closeDrawerMenu = useVectorFsStore((state) => state.closeDrawerMenu);
  const createTextFileForm = useForm<CreateTextFileFormSchema>({
    resolver: zodResolver(createTextFileFormSchema),
  });

  const { isPending, mutateAsync: uploadVRFiles } = useUploadVRFiles({
    onSuccess: (_) => {
      createTextFileForm.reset();
    },
    onError: (error) => {
      toast.error(t('vectorFs.errors.filesUploaded'), {
        id: 'uploading-VR-files',
        description: error.message,
      });
    },
  });

  const onSubmit = async (values: CreateTextFileFormSchema) => {
    if (!auth) return;
    closeDrawerMenu();
    const textFileContent = textFileContentRef.current?.value;
    if (!textFileContent) {
      toast.error('Please enter file content');
      return;
    }

    const textFile = new File([textFileContent], `${values.name}.txt`, {
      type: 'text/plain',
    });

    await uploadVRFiles({
      nodeAddress: auth?.node_address ?? '',
      destinationPath: currentGlobalPath,
      files: [textFile],
      token: auth?.api_v2_key ?? '',
    });
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex flex-col items-start gap-1">
          <FileType2Icon className="h-8 w-8" />
          {t('vectorFs.actions.createTextFile')}
        </SheetTitle>
      </SheetHeader>
      <Form {...createTextFileForm}>
        <form
          className="flex h-[calc(100vh-100px)] flex-col gap-8 pt-4"
          onSubmit={createTextFileForm.handleSubmit(onSubmit)}
        >
          <FormField
            control={createTextFileForm.control}
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
                      createTextFileForm.handleSubmit(onSubmit)();
                    }
                  },
                }}
                label={t('vectorFs.forms.textFileName')}
              />
            )}
          />
          <div className="flex flex-1 flex-col space-y-2">
            <p className="text-gray-80 text-xs font-medium">Content</p>
            <ToolCodeEditor
              language="txt"
              name={'text-file-content'}
              ref={textFileContentRef}
              style={{ height: '100%' }}
              value={''}
            />
          </div>
          <Button
            className="w-full"
            disabled={isPending}
            isLoading={isPending}
            type="submit"
          >
            {t('vectorFs.actions.createTextFile')}
          </Button>
        </form>
      </Form>
    </>
  );
};
