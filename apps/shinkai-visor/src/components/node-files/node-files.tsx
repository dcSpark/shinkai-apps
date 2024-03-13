import { zodResolver } from '@hookform/resolvers/zod';
import { HomeIcon } from '@radix-ui/react-icons';
import { useCreateVRFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/createVRFolder/useCreateVRFolder';
import { useUploadVRFiles } from '@shinkai_network/shinkai-node-state/lib/mutations/uploadVRFiles/useUploadVRFiles';
import { NodeFile } from '@shinkai_network/shinkai-node-state/lib/queries/getNodeFiles/types';
import { useGetNodeFiles } from '@shinkai_network/shinkai-node-state/lib/queries/getNodeFiles/useGetNodeFiles';
import { getVRPathSimplified } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/index';
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
  Checkbox,
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
  ScrollArea,
  TextField,
  UploadVectorResourceIcon,
} from '@shinkai_network/shinkai-ui';
import { partial } from 'filesize';
import {
  ChevronLeft,
  ChevronRight,
  DatabaseIcon,
  FileIcon,
  LockIcon,
  PlusIcon,
  SearchIcon,
  X,
  XIcon,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAuth } from '../../store/auth/auth';
import { FileInput } from '../file-input/file-input';
import { Header } from '../header/header';

const filterNodeFilesByCondition = (
  files: NodeFile[],
  condition: (file: NodeFile) => boolean,
  path: string = '',
): NodeFile[] => {
  let result: NodeFile[] = [];
  files.forEach((file) => {
    const newPath = path + '/' + file.name;
    if (file.type === 'folder') {
      result = result.concat(
        filterNodeFilesByCondition(file.items ?? [], condition, newPath),
      );
    }
    if (condition(file)) {
      file.path = newPath;
      result.push(file);
    }
  });
  return result;
};

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

  const {
    isLoading: isNodeFilesLoading,
    isSuccess: isNodeFilesSuccess,
    nodeFiles,
  } = useGetNodeFiles();
  const [currentPath, setCurrentPath] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeFile, setActiveFile] = React.useState<NodeFile | null>(null);
  const [selectionMode, setSelectionMode] = React.useState(false);

  const [isMenuOpened, setMenuOpened] = React.useState(false);

  const getCurrentFolder = () => {
    let currentFolder = [...nodeFiles];
    for (const folderName of currentPath) {
      const current = currentFolder.find(
        (item) => item.type === 'folder' && item.name === folderName,
      );
      if (!current) return [];
      currentFolder = current.items ?? [];
    }
    return currentFolder;
  };

  const totalStorage = filterNodeFilesByCondition(
    nodeFiles,
    (file) => file.type === 'file',
  ).reduce((acc, file) => acc + (file?.size ?? 0), 0);
  const totalFiles = filterNodeFilesByCondition(
    nodeFiles,
    (file) => file.type === 'file',
  ).length;

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
          {currentPath.length > 0 && (
            <Button
              onClick={() => {
                setCurrentPath(currentPath.slice(0, -1));
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
                      setCurrentPath([]);
                    }}
                  >
                    <HomeIcon />
                    Root
                  </button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {currentPath.length > 0 &&
                currentPath.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <BreadcrumbSeparator>
                      <ChevronRight />
                    </BreadcrumbSeparator>
                    {currentPath.length - 1 === idx ? (
                      <BreadcrumbPage>
                        <button
                          className="flex items-center gap-1"
                          onClick={() => {
                            setCurrentPath(currentPath.slice(0, idx + 1));
                          }}
                        >
                          <DirectoryTypeIcon />
                          {item}
                        </button>
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <button
                          className="flex items-center gap-1"
                          onClick={() => {
                            setCurrentPath(currentPath.slice(0, idx + 1));
                          }}
                        >
                          <DirectoryTypeIcon />
                          {item}
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
          {isNodeFilesLoading &&
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                className="mb-1 flex h-[69px] items-center justify-between gap-2 bg-gray-400 py-3"
                key={idx}
              />
            ))}
          {searchQuery
            ? filterNodeFilesByCondition(nodeFiles, (file) =>
                file.name.toLowerCase().includes(searchQuery.toLowerCase()),
              ).map((file, index: number) => {
                return (
                  <NodeFileItem
                    file={file}
                    key={index}
                    onClick={() => {
                      if (file.type === 'folder') {
                        setCurrentPath(
                          (file.path ?? '')?.split('/').filter(Boolean),
                        );
                        setSearchQuery('');
                      } else {
                        setActiveFile(file);
                      }
                    }}
                    selectionMode={selectionMode}
                  />
                );
              })
            : getCurrentFolder().map((file, index: number) => {
                return (
                  <NodeFileItem
                    file={file}
                    key={index}
                    onClick={() => {
                      if (file.type === 'folder') {
                        setCurrentPath((prev) => [...prev, file.name]);
                      } else {
                        setActiveFile(file);
                      }
                    }}
                    selectionMode={selectionMode}
                  />
                );
              })}
        </div>
      </ScrollArea>
      {isNodeFilesSuccess && (
        <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between rounded-t-md bg-gray-300 py-3">
          <span className="flex flex-1 items-center justify-center gap-1">
            <FileIcon className="h-4 w-4" />
            <span className="font-medium">{totalFiles} items</span>
          </span>
          <span className="flex flex-1 items-center justify-center gap-1">
            <DatabaseIcon className="h-4 w-4" />
            <span className="font-medium">{size(totalStorage)}</span>
          </span>
        </div>
      )}
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
                  {activeFile?.file_extension?.split('.').pop()}
                </Badge>
              </p>
              <p className="text-sm text-gray-100">
                <span>
                  {new Date(activeFile?.creation_date ?? '').toLocaleDateString(
                    'en-US',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    },
                  )}
                </span>{' '}
                - <span>{size(activeFile?.size ?? 0)}</span>
              </p>
            </div>
            <div className="py-6">
              <h2 className="mb-3 text-left text-lg font-medium  text-white">
                Information
              </h2>
              <div className="divide-y divide-gray-300">
                {[
                  { label: 'Created', value: '2021-10-10' },
                  { label: 'Modified', value: '2021-10-10' },
                  { label: 'Last Opened', value: '2021-10-10' },
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

const NodeFileItem = ({
  file,
  onClick,
  selectionMode,
}: {
  file: NodeFile;
  onClick: () => void;
  selectionMode: boolean;
}) => {
  const size = partial({ standard: 'jedec' });

  if (selectionMode) {
    return (
      <div className="flex items-center gap-3 py-3">
        <Checkbox id={`item-${file.name}`} />
        <label
          className="flex items-center gap-3"
          htmlFor={`item-${file.name}`}
        >
          <div>
            {file.type === 'folder' ? <DirectoryTypeIcon /> : <FileTypeIcon />}
          </div>
          <div className="flex-1 text-left">
            <div className="text-base font-medium">
              {file.name}
              {file.type === 'file' && (
                <Badge className="text-gray-80 ml-2 bg-gray-400 text-xs uppercase">
                  {file.file_extension?.split('.').pop()}
                </Badge>
              )}
            </div>
            {file.type === 'file' ? (
              <p className="text-sm text-gray-100">
                <span>
                  {new Date(file.creation_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>{' '}
                - <span>{size(file.size ?? 0)}</span>
              </p>
            ) : (
              <p className="text-sm text-gray-100">
                <span>
                  {new Date(file.creation_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>{' '}
                - <span>{file?.items?.length} files</span>
              </p>
            )}
          </div>
        </label>
      </div>
    );
  }

  return (
    <button
      className="flex items-center justify-between gap-2 py-3 hover:bg-gray-400"
      onClick={onClick}
    >
      <div>
        {file.type === 'folder' ? <DirectoryTypeIcon /> : <FileTypeIcon />}
      </div>
      <div className="flex-1 text-left">
        <div className="text-base font-medium">
          {file.name}
          {file.type === 'file' && (
            <Badge className="text-gray-80 ml-2 bg-gray-400 text-xs uppercase">
              {file.file_extension?.split('.').pop()}
            </Badge>
          )}
        </div>
        {file.type === 'file' ? (
          <p className="text-sm text-gray-100">
            <span>
              {new Date(file.creation_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>{' '}
            - <span>{size(file.size ?? 0)}</span>
          </p>
        ) : (
          <p className="text-sm text-gray-100">
            <span>
              {new Date(file.creation_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>{' '}
            - <span>{file?.items?.length} files</span>
          </p>
        )}
      </div>
      <ChevronRight />
    </button>
  );
};

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
  } = useCreateVRFolder();

  const onSubmit = async (values: z.infer<typeof createFolderSchema>) => {
    if (!auth) return;

    await createVRFolder({
      nodeAddress: auth?.node_address ?? '',
      profile: auth?.profile ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      folderName: values.name,
      path: '/',
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

  const {
    isPending,
    mutateAsync: uploadVRFiles,
    isSuccess,
  } = useUploadVRFiles();

  const onSubmit = async (values: z.infer<typeof uploadVRFilesSchema>) => {
    if (!auth) return;

    await uploadVRFiles({
      nodeAddress: auth?.node_address ?? '',
      sender: auth?.profile ?? '',
      senderSubidentity: auth?.profile ?? '',
      receiver: auth?.profile ?? '',
      destinationPath: '/',
      files: values.files,
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
                  <FileInput
                    extensions={['.pdf']}
                    multiple
                    onValueChange={field.onChange}
                    value={field.value}
                  />
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
