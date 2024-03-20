import { zodResolver } from '@hookform/resolvers/zod';
import { HomeIcon } from '@radix-ui/react-icons';
import { useCreateVRFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/createVRFolder/useCreateVRFolder';
import { useUploadVRFiles } from '@shinkai_network/shinkai-node-state/lib/mutations/uploadVRFiles/useUploadVRFiles';
import {
  VRFolder,
  VRItem,
} from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/types';
import { useGetVRPathSimplified } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/useGetVRPathSimplified';
import {
  AddNewFolderIcon,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  CreateAIIcon,
  DirectoryTypeIcon,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FileEmptyStateIcon,
  FileTypeIcon,
  FileUploader,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  GenerateDocIcon,
  Input,
  ScrollArea,
  TextField,
  ToggleGroup,
  ToggleGroupItem,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { partial } from 'filesize';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  LayoutGrid,
  List,
  // DatabaseIcon,
  // FileIcon,
  // DatabaseIcon,
  // FileIcon,
  LockIcon,
  PlusIcon,
  SearchIcon,
  X,
  XIcon,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { formatDateToLocaleString } from '../../helpers/date';
import { useAuth } from '../../store/auth/auth';
import { Header } from '../header/header';
import {
  useVectorFsStore,
  VectorFsDrawerMenuOption,
  VectorFSLayout,
} from './node-file-context';
import VectorFsFolder from './vector-fs-folder';
import VectorFsItem from './vector-fs-item';

enum NodeFilesDrawerOptions {
  NewFolder = 'new-folder',
  // UploadVectorResource = 'upload-vector-resource',
  GenerateFromDocument = 'generate-from-document',
  // GenerateFromWeb = 'generate-from-web',
}

const MotionButton = motion(Button);
const CreateAIIconMotion = motion(CreateAIIcon);
export default function NodeFiles() {
  const size = partial({ standard: 'jedec' });
  const auth = useAuth((state) => state.auth);
  const history = useHistory();

  const currentGlobalPath = useVectorFsStore(
    (state) => state.currentGlobalPath,
  );
  const setCurrentGlobalPath = useVectorFsStore(
    (state) => state.setCurrentGlobalPath,
  );
  const activeDrawerMenuOption = useVectorFsStore(
    (state) => state.activeDrawerMenuOption,
  );
  const setActiveDrawerMenuOption = useVectorFsStore(
    (state) => state.setActiveDrawerMenuOption,
  );
  const layout = useVectorFsStore((state) => state.layout);
  const setLayout = useVectorFsStore((state) => state.setLayout);

  const {
    isPending: isVRFilesPending,
    data: VRFiles,
    isSuccess: isVRFilesSuccess,
  } = useGetVRPathSimplified({
    nodeAddress: auth?.node_address ?? '',
    profile: auth?.profile ?? '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    path: currentGlobalPath,
    my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
    my_device_identity_sk: auth?.profile_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeFile, setActiveFile] = React.useState<VRItem | null>(null);
  const [selectionMode, setSelectionMode] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<VRItem[]>([]);
  const [selectedFolders, setSelectedFolders] = React.useState<VRFolder[]>([]);
  const [isMenuOpened, setMenuOpened] = React.useState(false);

  const handleSelectFiles = (file: VRItem) => {
    if (selectedFiles.some((selectedFile) => selectedFile.path === file.path)) {
      setSelectedFiles(selectedFiles.filter((item) => item !== file));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  const handleSelectFolders = (folder: VRFolder) => {
    if (
      selectedFolders.some(
        (selectedFolder) => selectedFolder.path === folder.path,
      )
    ) {
      setSelectedFolders(selectedFolders.filter((item) => item !== folder));
    } else {
      setSelectedFolders([...selectedFolders, folder]);
    }
  };

  const actionList = [
    {
      name: 'Add new folder',
      icon: <AddNewFolderIcon className="mr-2 h-4 w-4" />,
      onClick: () => {
        setActiveDrawerMenuOption(VectorFsDrawerMenuOption.NewFolder);
      },
    },
    {
      name: 'File Upload',
      icon: <GenerateDocIcon className="mr-2 h-4 w-4" />,
      disabled: currentGlobalPath === '/',
      onClick: () => {
        setActiveDrawerMenuOption(
          VectorFsDrawerMenuOption.GenerateFromDocument,
        );
      },
    },
  ];

  const renderDrawerOptionMap = {
    [NodeFilesDrawerOptions.NewFolder]: <AddNewFolderDrawer />,
    [NodeFilesDrawerOptions.GenerateFromDocument]: <UploadVRFilesDrawer />,
  };

  const splitCurrentPath = VRFiles?.path?.split('/').filter(Boolean) ?? [];

  return (
    <div className="flex h-full flex-col gap-4">
      <Header title={'Node Files'} />
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-full flex-1 items-center">
          <Input
            className="placeholder-gray-80 !h-full bg-gray-200 py-2 pl-10"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            value={searchQuery}
          />
          <SearchIcon className="absolute left-4 top-1/2 -z-[1px] h-4 w-4 -translate-y-1/2 bg-gray-300" />
          {searchQuery && (
            <Button
              className="absolute right-1 h-8 w-8 bg-gray-200 p-2"
              onClick={() => {
                setSearchQuery('');
              }}
              size="auto"
              type="button"
              variant="ghost"
            >
              <XIcon />
              <span className="sr-only">Clear Search</span>
            </Button>
          )}
        </div>
        <DropdownMenu
          modal={false}
          onOpenChange={(value) => setMenuOpened(value)}
          open={isMenuOpened}
        >
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              {!isMenuOpened ? (
                <PlusIcon className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            alignOffset={-10}
            className="w-[200px] px-2 py-2"
            sideOffset={10}
          >
            {actionList.map((item, index) => (
              <DropdownMenuItem
                disabled={item.disabled}
                key={index}
                onClick={item.onClick}
              >
                {item.icon}
                <span>{item.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <ToggleGroup type="single" value={layout}>
          <ToggleGroupItem
            aria-label="Toggle layout grid"
            onClick={() => {
              setLayout(VectorFSLayout.Grid);
            }}
            value="grid"
          >
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            aria-label="Toggle layout list"
            onClick={() => {
              setLayout(VectorFSLayout.List);
            }}
            value="list"
          >
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <Drawer
          onOpenChange={(open) => {
            if (!open) {
              setActiveDrawerMenuOption(null);
            }
          }}
          open={!!activeDrawerMenuOption}
        >
          <DrawerContent>
            <DrawerClose className="absolute right-4 top-5">
              <XIcon className="text-gray-80" />
            </DrawerClose>
            <div className="space-y-8">
              {activeDrawerMenuOption &&
                renderDrawerOptionMap[activeDrawerMenuOption]}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
      {!searchQuery && (
        <div className="mt-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <button
                    className={cn(
                      'flex items-center gap-2 rounded-full p-2 hover:bg-gray-400',
                      currentGlobalPath === '/' && 'text-white',
                    )}
                    onClick={() => {
                      setCurrentGlobalPath('/');
                    }}
                  >
                    <HomeIcon className="h-3.5 w-3.5" />
                    Home
                  </button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {splitCurrentPath.map((path, idx) => (
                <React.Fragment key={idx}>
                  <BreadcrumbSeparator>
                    <ChevronRight />
                  </BreadcrumbSeparator>
                  {splitCurrentPath.length - 1 === idx ? (
                    <BreadcrumbPage className="flex items-center gap-1 p-2 font-medium">
                      {path}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <button
                        className="flex items-center gap-1 rounded-full bg-transparent p-2 hover:bg-gray-400"
                        onClick={() => {
                          const buildPath = splitCurrentPath
                            .slice(0, idx + 1)
                            .join('/');
                          setCurrentGlobalPath('/' + buildPath);
                        }}
                      >
                        {path}
                      </button>
                    </BreadcrumbLink>
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}
      <ScrollArea>
        <div
          className={cn(
            'grid flex-1',
            layout === VectorFSLayout.Grid &&
              'grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
            layout === VectorFSLayout.List &&
              'grid-cols-1 divide-y divide-gray-400',
          )}
        >
          {isVRFilesPending &&
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                className="mb-1 flex h-[69px] items-center justify-between gap-2 bg-gray-400 py-3"
                key={idx}
              />
            ))}
          {VRFiles?.child_folders.map((folder, index: number) => {
            return (
              <VectorFsFolder
                folder={folder}
                handleSelectFolders={handleSelectFolders}
                isSelectedFolder={selectedFolders.some(
                  (selectedFolder) => selectedFolder.path === folder.path,
                )}
                key={index}
                onClick={() => {
                  setCurrentGlobalPath(folder.path);
                }}
                selectionMode={selectionMode}
                setCurrentGlobalPath={setCurrentGlobalPath}
              />
            );
          })}
          {isVRFilesSuccess &&
            (VRFiles?.child_folders || [])?.length === 0 &&
            currentGlobalPath === '/' && (
              <div className="text-gray-80 mt-4 flex flex-col items-center justify-center gap-4 text-center text-base">
                <FileEmptyStateIcon className="h-20 w-20" />
                <div>
                  <h2 className="font-medium text-white">
                    This will be the home for all your files.
                  </h2>
                  <span>
                    Use the &quot;+&quot; button to start uploading files.
                  </span>
                </div>
              </div>
            )}
          {isVRFilesSuccess &&
            VRFiles?.child_items?.length > 0 &&
            VRFiles?.child_items.map((file, index: number) => {
              return (
                <VectorFsItem
                  file={file}
                  handleSelectFiles={handleSelectFiles}
                  isSelectedFile={selectedFiles.some(
                    (selectedFile) => selectedFile.path === file.path,
                  )}
                  key={index}
                  onClick={() => {
                    setActiveFile(file);
                  }}
                  selectionMode={selectionMode}
                />
              );
            })}
          {isVRFilesSuccess &&
            VRFiles?.child_items?.length === 0 &&
            VRFiles.child_folders?.length === 0 && (
              <div className="flex h-20 items-center justify-center text-gray-100">
                No files found
              </div>
            )}
        </div>
      </ScrollArea>
      <ContextMenu>
        <ContextMenuTrigger className="flex-1">
          <span className="sr-only">See options</span>
        </ContextMenuTrigger>
        <ContextMenuContent className="p-2">
          {actionList.map((item, index) => (
            <ContextMenuItem
              disabled={item.disabled}
              key={index}
              onClick={item.onClick}
            >
              {item.icon}
              <span>{item.name}</span>
            </ContextMenuItem>
          ))}
        </ContextMenuContent>
      </ContextMenu>

      {/*<div className="fixed bottom-0 left-0 right-0 flex items-center justify-between rounded-t-md bg-gray-300 py-3">*/}
      {/*  <span className="flex flex-1 items-center justify-center gap-1">*/}
      {/*    <FileIcon className="h-4 w-4" />*/}
      {/*    <span className="font-medium">TODO items</span>*/}
      {/*  </span>*/}
      {/*  <span className="flex flex-1 items-center justify-center gap-1">*/}
      {/*    <DatabaseIcon className="h-4 w-4" />*/}
      {/*    <span className="font-medium">TODO</span>*/}
      {/*  </span>*/}
      {/*</div>*/}

      <MotionButton
        className={cn(
          'fixed bottom-16 right-4 h-[60px] w-[60px]',
          selectionMode && 'w-[210px]',
        )}
        layout
        onClick={() => {
          if (!selectionMode) {
            setSelectionMode(true);
          } else {
            history.push({
              pathname: '/inboxes/create-job',
              state: {
                selectedVRFiles: selectedFiles,
                selectedVRFolders: selectedFolders,
              },
            });
          }
        }}
        size={selectionMode ? 'lg' : 'icon'}
        transition={{
          // delayChildren: 1,
          duration: 0.2,
        }}
      >
        {!selectionMode && <CreateAIIconMotion layout />}
        <motion.div
          className={cn(
            'sr-only flex flex-col',
            selectionMode && 'not-sr-only',
          )}
          layout
        >
          <span>Create AI Chat</span>
          {selectionMode && (
            <span className="text-sm text-neutral-200">
              {selectedFiles.length + selectedFolders.length} selected
            </span>
          )}
        </motion.div>
      </MotionButton>
      {selectionMode && (
        <MotionButton
          animate={{ opacity: 1 }}
          className="fixed bottom-20 right-[230px] h-[24px] w-[24px] border border-gray-100 bg-gray-300 p-1 text-gray-50 hover:bg-gray-500 hover:text-white"
          initial={{ opacity: 0 }}
          onClick={() => setSelectionMode(false)}
          size="icon"
          transition={{
            duration: 0.4,
          }}
          variant="outline"
        >
          <span className="sr-only">Unselect All</span>
          <XIcon />
        </MotionButton>
      )}

      <Drawer
        onOpenChange={(open) => {
          if (!open) {
            setActiveFile(null);
          }
        }}
        open={!!activeFile}
      >
        <DrawerContent>
          <DrawerClose className="absolute right-4 top-5">
            <XIcon className="text-gray-80" />
          </DrawerClose>
          <DrawerHeader>
            <DrawerTitle className={'sr-only'}>Information</DrawerTitle>
          </DrawerHeader>
          <div>
            <div className="space-y-2 text-left">
              <div>
                <FileTypeIcon className="h-10 w-10" />
              </div>
              <p className="text-lg font-medium text-white">
                {activeFile?.name}
                <Badge className="text-gray-80 ml-2 bg-gray-400 text-xs uppercase">
                  {activeFile?.vr_header?.resource_source?.Reference?.FileRef
                    ?.file_type?.Document ?? '-'}
                </Badge>
              </p>
              <p className="text-sm text-gray-100">
                <span>
                  {formatDateToLocaleString(activeFile?.created_datetime)}
                </span>{' '}
                - <span>{size(activeFile?.vr_size ?? 0)}</span>
              </p>
            </div>
            <div className="py-6">
              <h2 className="mb-3 text-left text-lg font-medium  text-white">
                Information
              </h2>
              <div className="divide-y divide-gray-300">
                {[
                  { label: 'Created', value: activeFile?.created_datetime },
                  {
                    label: 'Modified',
                    value: activeFile?.last_written_datetime,
                  },
                  {
                    label: 'Last Opened',
                    value: activeFile?.last_read_datetime,
                  },
                ].map((item) => (
                  <div
                    className="flex items-center justify-between py-2 font-medium"
                    key={item.label}
                  >
                    <span className="text-gray-100">{item.label}</span>
                    <span className="text-white">
                      {formatDateToLocaleString(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="py-6 text-left">
              <h2 className="mb-3 text-lg font-medium  text-white">
                Permissions
              </h2>
              <span>
                <LockIcon className="mr-2 inline-block h-4 w-4" />
                You can read and write
              </span>
            </div>
          </div>

          <DrawerFooter>
            <Button>Download Source File</Button>
            <Button variant="outline">Download Vector Resource</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

const createFolderSchema = z.object({
  name: z.string(),
});
const AddNewFolderDrawer = () => {
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
          className="space-y-8"
          onSubmit={createFolderForm.handleSubmit(onSubmit)}
        >
          <FormField
            control={createFolderForm.control}
            name="name"
            render={({ field }) => (
              <TextField field={field} label="Folder Name" />
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
  files: z.array(z.any()).max(3),
});
const UploadVRFilesDrawer = () => {
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
      description: 'This process might take from 1-2 minutes',
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
