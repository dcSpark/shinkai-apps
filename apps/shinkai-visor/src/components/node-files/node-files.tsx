import { zodResolver } from '@hookform/resolvers/zod';
import { HomeIcon } from '@radix-ui/react-icons';
import { useCreateVRFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/createVRFolder/useCreateVRFolder';
import { useUploadVRFiles } from '@shinkai_network/shinkai-node-state/lib/mutations/uploadVRFiles/useUploadVRFiles';
import { getVRPathSimplified } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/index';
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
  // Checkbox,
  CreateAIIcon,
  DirectoryTypeIcon,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FileTypeIcon,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  GenerateDocIcon,
  GenerateFromWebIcon,
  Input,
  PaperClipIcon,
  ScrollArea,
  TextField,
  UploadVectorResourceIcon,
} from '@shinkai_network/shinkai-ui';
import { partial } from 'filesize';
import {
  ChevronLeft,
  ChevronRight,
  // DatabaseIcon,
  // FileIcon,
  LockIcon,
  PlusIcon,
  SearchIcon,
  Trash,
  Upload,
  X,
  XIcon,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { Accept, useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAuth } from '../../store/auth/auth';
import { Header } from '../header/header';

// const filterNodeFilesByCondition = (
//   files: NodeFile[],
//   condition: (file: NodeFile) => boolean,
//   path: string = '',
// ): NodeFile[] => {
//   let result: NodeFile[] = [];
//   files.forEach((file) => {
//     const newPath = path + '/' + file.name;
//     if (file.type === 'folder') {
//       result = result.concat(
//         filterNodeFilesByCondition(file.items ?? [], condition, newPath),
//       );
//     }
//     if (condition(file)) {
//       file.path = newPath;
//       result.push(file);
//     }
//   });
//   return result;
// };

enum NodeFilesDrawerOptions {
  NewFolder = 'new-folder',
  UploadVectorResource = 'upload-vector-resource',
  GenerateFromDocument = 'generate-from-document',
  GenerateFromWeb = 'generate-from-web',
}
export default function NodeFiles() {
  const size = partial({ standard: 'jedec' });
  const [selectedDrawerOption, setSelectedDrawerOption] =
    React.useState<NodeFilesDrawerOptions | null>(null);
  const auth = useAuth((state) => state.auth);
  const [currentPath, setCurrentPath] = React.useState<string>('/');

  const { isPending: isVRFilesPending, data: VRFiles } = useGetVRPathSimplified(
    {
      nodeAddress: auth?.node_address ?? '',
      profile: auth?.profile ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      path: currentPath,
      my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
      my_device_identity_sk: auth?.profile_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    },
  );
  console.log(VRFiles, 'VRFiles');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeFile, setActiveFile] = React.useState<VRItem | null>(null);
  const [selectionMode, setSelectionMode] = React.useState(false);

  const [isMenuOpened, setMenuOpened] = React.useState(false);

  // const getCurrentFolder = () => {
  //   let currentFolder = [...nodeFiles];
  //   for (const folderName of currentPath) {
  //     const current = currentFolder.find(
  //       (item) => item.type === 'folder' && item.name === folderName,
  //     );
  //     if (!current) return [];
  //     currentFolder = current.items ?? [];
  //   }
  //   return currentFolder;
  // };

  // const totalStorage = filterNodeFilesByCondition(
  //   nodeFiles,
  //   (file) => file.type === 'file',
  // ).reduce((acc, file) => acc + (file?.size ?? 0), 0);
  // const totalFiles = filterNodeFilesByCondition(
  //   nodeFiles,
  //   (file) => file.type === 'file',
  // ).length;

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
            className="w-[260px] space-y-2.5 rounded-br-none rounded-tr-none"
            sideOffset={10}
          >
            {[
              {
                name: 'Add new folder',
                icon: <AddNewFolderIcon className="mr-2 h-4 w-4" />,
                onClick: () => {
                  setSelectedDrawerOption(NodeFilesDrawerOptions.NewFolder);
                },
              },
              {
                name: 'Upload vector resource',
                icon: <UploadVectorResourceIcon className="mr-2 h-4 w-4" />,
                onClick: () => {
                  setSelectedDrawerOption(
                    NodeFilesDrawerOptions.UploadVectorResource,
                  );
                },
              },
              {
                name: 'Generate from document',
                icon: <GenerateDocIcon className="mr-2 h-4 w-4" />,
                onClick: () => {
                  setSelectedDrawerOption(
                    NodeFilesDrawerOptions.GenerateFromDocument,
                  );
                },
              },
              {
                name: 'Generate from Web',
                icon: <GenerateFromWebIcon className="mr-2 h-4 w-4" />,
                onClick: () => {
                  setSelectedDrawerOption(
                    NodeFilesDrawerOptions.GenerateFromWeb,
                  );
                },
              },
            ].map((item, index) => (
              <DropdownMenuItem key={index} onClick={item.onClick}>
                {item.icon}
                <span>{item.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Drawer
          onOpenChange={(open) => {
            if (!open) {
              setSelectedDrawerOption(null);
            }
          }}
          open={!!selectedDrawerOption}
        >
          <DrawerContent>
            <DrawerClose className="absolute right-4 top-5">
              <XIcon className="text-gray-80" />
            </DrawerClose>
            <div className="space-y-8">
              {selectedDrawerOption &&
                {
                  [NodeFilesDrawerOptions.NewFolder]: <AddNewFolderDrawer />,
                  [NodeFilesDrawerOptions.UploadVectorResource]: (
                    <UploadVRFilesDrawer />
                  ),
                  [NodeFilesDrawerOptions.GenerateFromDocument]: (
                    <DrawerDescription>
                      Generate from Document
                    </DrawerDescription>
                  ),
                  [NodeFilesDrawerOptions.GenerateFromWeb]: (
                    <DrawerDescription>Generate from Web</DrawerDescription>
                  ),
                }[selectedDrawerOption]}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
      {!searchQuery && (
        <div className="mt-4 flex items-center gap-3">
          {(VRFiles?.path.split('/').filter(Boolean) || []).length > 0 && (
            <Button
              onClick={() => {
                const prevPath = VRFiles?.path.split('/').filter(Boolean) || [];
                setCurrentPath(
                  '/' + prevPath.slice(0, prevPath.length - 1).join('/'),
                );
              }}
              size={'icon'}
              variant="ghost"
            >
              <ChevronLeft />
            </Button>
          )}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <button
                    className="flex items-center gap-2 py-2"
                    onClick={() => {
                      setCurrentPath('/');
                    }}
                  >
                    <HomeIcon />
                    Root
                  </button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {VRFiles?.path
                ?.split('/')
                .filter(Boolean)
                .map((path, idx) => (
                  <React.Fragment key={idx}>
                    <BreadcrumbSeparator>
                      <ChevronRight />
                    </BreadcrumbSeparator>
                    {VRFiles?.path?.split('/').length - 1 === idx ? (
                      <BreadcrumbPage>
                        <button
                          className="flex items-center gap-1"
                          onClick={() => {
                            setCurrentPath('/' + path);
                          }}
                        >
                          <DirectoryTypeIcon />
                          {path}
                        </button>
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <button
                          className="flex items-center gap-1"
                          onClick={() => {
                            setCurrentPath('/' + path);
                          }}
                        >
                          <DirectoryTypeIcon />
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
        <div className="flex flex-1 flex-col divide-y divide-gray-400">
          {isVRFilesPending &&
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                className="mb-1 flex h-[69px] items-center justify-between gap-2 bg-gray-400 py-3"
                key={idx}
              />
            ))}
          {VRFiles?.child_folders.map((folder, index: number) => {
            return (
              <FolderVRItem
                folder={folder}
                key={index}
                onClick={() => {
                  setCurrentPath(folder.path);
                }}
                // selectionMode={selectionMode}
              />
            );
          })}
          {(VRFiles?.child_items?.length ?? 0) > 0 &&
            VRFiles?.child_items.map((file, index: number) => {
              return (
                <FileVRItem
                  file={file}
                  key={index}
                  onClick={() => {
                    setActiveFile(file);
                  }}
                  // selectionMode={selectionMode}
                />
              );
            })}
        </div>
      </ScrollArea>
      {/*{isNodeFilesSuccess && (*/}
      {/*  <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between rounded-t-md bg-gray-300 py-3">*/}
      {/*    <span className="flex flex-1 items-center justify-center gap-1">*/}
      {/*      <FileIcon className="h-4 w-4" />*/}
      {/*      <span className="font-medium">{totalFiles} items</span>*/}
      {/*    </span>*/}
      {/*    <span className="flex flex-1 items-center justify-center gap-1">*/}
      {/*      <DatabaseIcon className="h-4 w-4" />*/}
      {/*      <span className="font-medium">{size(totalStorage)}</span>*/}
      {/*    </span>*/}
      {/*  </div>*/}
      {/*)}*/}
      <Button
        className="fixed bottom-12 right-4 h-[60px] w-[60px]"
        onClick={() => setSelectionMode(true)}
        size="icon"
      >
        <span className="sr-only">Create AI DM</span>
        <CreateAIIcon />
      </Button>
      {selectionMode && (
        <Button
          className="fixed bottom-14 right-14 h-[24px] w-[24px] bg-white text-gray-500"
          onClick={() => setSelectionMode(false)}
          size="icon"
          variant="outline"
        >
          <span className="sr-only">Unselect All</span>
          <XIcon />
        </Button>
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
                  {new Date(
                    activeFile?.created_datetime ?? '',
                  ).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
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
                      {new Date(item.value ?? '').toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
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

const FolderVRItem = ({
  onClick,
  folder,
}: {
  onClick: () => void;
  folder: VRFolder;
}) => {
  const totalItem =
    (folder.child_folders?.length ?? 0) + (folder.child_items?.length ?? 0);
  return (
    <button
      className="flex items-center justify-between gap-2 py-3 hover:bg-gray-400"
      onClick={onClick}
    >
      <DirectoryTypeIcon />
      <div className="flex-1 text-left">
        <div className="text-base font-medium">{folder.name}</div>
        <p className="text-sm text-gray-100">
          <span>
            {new Date(folder.created_datetime).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>{' '}
          - <span>{totalItem} items</span>
        </p>
      </div>
      <ChevronRight />
    </button>
  );
};
const FileVRItem = ({
  onClick,
  file,
}: {
  onClick: () => void;
  file: VRItem;
}) => {
  const size = partial({ standard: 'jedec' });

  return (
    <button
      className="flex items-center justify-between gap-2 py-3 hover:bg-gray-400"
      onClick={onClick}
    >
      <FileTypeIcon />
      <div className="flex-1 text-left">
        <div className="text-base font-medium">
          {file.name}
          <Badge className="text-gray-80 ml-2 bg-gray-400 text-xs uppercase">
            {file?.vr_header?.resource_source?.Reference?.FileRef?.file_type
              ?.Document ?? '-'}
          </Badge>
        </div>
        <p className="text-sm text-gray-100">
          <span>
            {new Date(file.created_datetime).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>{' '}
          - <span>{size(file.vr_size)}</span>
        </p>
      </div>
      <ChevronRight />
    </button>
  );
};
// const NodeFileItem = ({
//   folder,
//   onClick,
//   selectionMode,
// }: {
//   folder: VRFolder;
//   onClick: () => void;
//   selectionMode: boolean;
// }) => {
//   const size = partial({ standard: 'jedec' });
//
//   const isFolderItem = 'child_folders' in folder;
//
//   if (selectionMode) {
//     return (
//       <div className="flex items-center gap-3 py-3">
//         <Checkbox id={`item-${folder.name}`} />
//         <label
//           className="flex items-center gap-3"
//           htmlFor={`item-${folder.name}`}
//         >
//           <div>{isFolderItem ? <DirectoryTypeIcon /> : <FileTypeIcon />}</div>
//           <div className="flex-1 text-left">
//             <div className="text-base font-medium">
//               {folder.name}
//               {/*{isFolderItem && (*/}
//               {/*  <Badge className="text-gray-80 ml-2 bg-gray-400 text-xs uppercase">*/}
//               {/*    {folder.file_extension?.split('.').pop()}*/}
//               {/*  </Badge>*/}
//               {/*)}*/}
//             </div>
//             {isFolderItem ? (
//               <p className="text-sm text-gray-100">
//                 <span>
//                   {new Date(folder.created_datetime).toLocaleDateString(
//                     'en-US',
//                     {
//                       year: 'numeric',
//                       month: 'long',
//                       day: 'numeric',
//                     },
//                   )}
//                 </span>{' '}
//                 {/*- <span>{size(folder.size ?? 0)}</span>*/}
//               </p>
//             ) : (
//               <p className="text-sm text-gray-100">
//                 <span>
//                   {new Date(folder.created_datetime).toLocaleDateString(
//                     'en-US',
//                     {
//                       year: 'numeric',
//                       month: 'long',
//                       day: 'numeric',
//                     },
//                   )}
//                 </span>{' '}
//                 -{' '}
//                 <span>
//                   {folder?.child_items?.length + folder?.child_folders?.length}{' '}
//                   files
//                 </span>
//               </p>
//             )}
//           </div>
//         </label>
//       </div>
//     );
//   }
//
//   return (
//     <button
//       className="flex items-center justify-between gap-2 py-3 hover:bg-gray-400"
//       onClick={onClick}
//     >
//       <div>{isFolderItem ? <DirectoryTypeIcon /> : <FileTypeIcon />}</div>
//       <div className="flex-1 text-left">
//         <div className="text-base font-medium">
//           {folder.name}
//           {/*{isFolderItem && (*/}
//           {/*  <Badge className="text-gray-80 ml-2 bg-gray-400 text-xs uppercase">*/}
//           {/*    {folder.file_extension?.split('.').pop()}*/}
//           {/*  </Badge>*/}
//           {/*)}*/}
//         </div>
//         {isFolderItem ? (
//           <p className="text-sm text-gray-100">
//             <span>
//               {new Date(folder.created_datetime).toLocaleDateString('en-US', {
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric',
//               })}
//             </span>{' '}
//             {/*- <span>{size(folder. ?? 0)}</span>*/}
//           </p>
//         ) : (
//           <p className="text-sm text-gray-100">
//             <span>
//               {new Date(folder.created_datetime).toLocaleDateString('en-US', {
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric',
//               })}
//             </span>{' '}
//             - <span>{folder?.child_items?.length} files</span>
//           </p>
//         )}
//       </div>
//       <ChevronRight />
//     </button>
//   );
// };

const createFolderSchema = z.object({
  name: z.string(),
});
const AddNewFolderDrawer = () => {
  const auth = useAuth((state) => state.auth);

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
      path: '/paulclindo',
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

  useEffect(() => {
    const load = async () => {
      const data = await getVRPathSimplified({
        nodeAddress: auth?.node_address ?? '',
        profile: auth?.profile ?? '',
        shinkaiIdentity: auth?.shinkai_identity ?? '',
        path: '/',
        my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
        my_device_identity_sk: auth?.profile_identity_sk ?? '',
        node_encryption_pk: auth?.node_encryption_pk ?? '',
        profile_encryption_sk: auth?.profile_encryption_sk ?? '',
        profile_identity_sk: auth?.profile_identity_sk ?? '',
      });
      console.log(data, 'fromretriveve');
    };
    load();
  });
  return (
    <>
      <DrawerHeader>
        <DrawerTitle className="flex flex-col items-start gap-1">
          <DirectoryTypeIcon className="h-10 w-10" />
          Add Folder
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

  const createFolderForm = useForm<z.infer<typeof uploadVRFilesSchema>>({
    resolver: zodResolver(uploadVRFilesSchema),
  });

  const { isPending, mutateAsync: uploadVRFiles } = useUploadVRFiles({
    onSuccess: () => {
      toast.success('Files uploaded successfully');
      createFolderForm.reset();
    },
    onError: () => {
      toast.error('Error uploading files');
    },
  });

  const onSubmit = async (values: z.infer<typeof uploadVRFilesSchema>) => {
    if (!auth) return;

    console.log(values, 'values');

    await uploadVRFiles({
      nodeAddress: auth?.node_address ?? '',
      sender: auth?.shinkai_identity ?? '',
      senderSubidentity: auth?.profile ?? '',
      receiver: auth?.shinkai_identity ?? '',
      destinationPath: '/paulclindo',
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
          <DirectoryTypeIcon className="h-10 w-10" />
          Add Folder
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
                      <FileInput
                        // accept={{
                        //   'application/x-iwork-keynote-sffkey': ['.key'],
                        // }}
                        maxFiles={1}
                        onChange={(acceptedFiles) => {
                          // onConnectionFileSelected(acceptedFiles);
                          field.onChange(acceptedFiles);
                        }}
                        value={field.value}
                      />
                    </div>
                    {/*{!!encryptedConnectionFileValue?.length && (*/}
                    {/*  <div className="truncate rounded-lg bg-gray-400 px-2 py-2">*/}
                    {/*    {encryptedConnectionFileValue[0].encryptedConnection}*/}
                    {/*  </div>*/}
                    {/*)}*/}
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
            Upload VR Files
          </Button>
        </form>
      </Form>
    </>
  );
};

const FileInput = ({
  value,
  onChange,
  maxFiles,
  accept,
  multiple,
}: {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  accept?: Accept;
  multiple?: boolean;
}) => {
  const { getRootProps: getRootFileProps, getInputProps: getInputFileProps } =
    useDropzone({
      multiple: multiple,
      maxFiles: maxFiles ?? 5,
      accept,
      onDrop: (acceptedFiles) => {
        onChange(acceptedFiles);
      },
    });

  return (
    <div className="flex w-full flex-col gap-2">
      <div
        {...getRootFileProps({
          className:
            'dropzone py-4 bg-gray-400 group relative mt-3 flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-100 transition-colors hover:border-white',
        })}
      >
        <div className="flex flex-col items-center justify-center space-y-1">
          <div>
            <Upload className="h-4 w-4" />
          </div>
          <p className="text-sm text-white">
            <FormattedMessage id="click-to-upload" />
          </p>
          <p className="text-gray-80 text-xs">Eg: shinkai.key</p>
        </div>

        <input {...getInputFileProps({})} />
      </div>
      {!!value?.length && (
        <div className="flex flex-col gap-2">
          {value?.map((file, idx) => (
            <div
              className="relative flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-1.5"
              key={idx}
            >
              <PaperClipIcon className="text-gray-100" />
              <span className="text-gray-80 flex-1 truncate text-sm">
                {file.name}
              </span>
              <Button
                onClick={() => {
                  const newFiles = [...value];
                  newFiles.splice(newFiles.indexOf(file), 1);
                  onChange(newFiles);
                }}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Trash className="h-4 w-4 text-gray-100" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
