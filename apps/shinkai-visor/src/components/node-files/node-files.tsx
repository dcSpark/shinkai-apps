import { HomeIcon } from '@radix-ui/react-icons';
import { NodeFile } from '@shinkai_network/shinkai-node-state/lib/queries/getNodeFiles/types';
import { useGetNodeFiles } from '@shinkai_network/shinkai-node-state/lib/queries/getNodeFiles/useGetNodeFiles';
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
  GenerateDocIcon,
  GenerateFromWebIcon,
  Input,
  ScrollArea,
  UploadVectorResourceIcon,
} from '@shinkai_network/shinkai-ui';
import {
  ChevronLeft,
  ChevronRight,
  LockIcon,
  PlusIcon,
  SearchIcon,
  X,
  XIcon,
} from 'lucide-react';
import React from 'react';

import { Header } from '../header/header';

export default function NodeFiles() {
  const { nodeFiles } = useGetNodeFiles();
  const [prevActiveFileBranch, setPrevActiveFileBranch] = React.useState<
    NodeFile[][]
  >([]);
  const [activeFileBranch, setActiveFileBranch] = React.useState<NodeFile[]>(
    [],
  );
  const [activeFile, setActiveFile] = React.useState<NodeFile | null>(null);

  const [querySearch, setQuerySearch] = React.useState('');
  const [selectionMode, setSelectionMode] = React.useState(false);

  React.useEffect(() => {
    setActiveFileBranch(nodeFiles ?? []);
  }, [nodeFiles]);

  const filteredFiles = querySearch
    ? nodeFiles.filter((file) =>
        file.name.toLowerCase().includes(querySearch.toLowerCase()),
      )
    : nodeFiles;

  const [isMenuOpened, setMenuOpened] = React.useState(false);

  return (
    <div className="flex h-full flex-col gap-4">
      <Header title={'Node Files'} />
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-full flex-1 items-center">
          <Input
            className="placeholder-gray-80 !h-full bg-gray-200 py-2 pl-10"
            onChange={(e) => setQuerySearch(e.target.value)}
            placeholder="Search..."
          />
          <SearchIcon className="absolute left-4 top-1/2 -z-[1px] h-4 w-4 -translate-y-1/2 bg-gray-300" />
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
                onClick: () => {},
              },
              {
                name: 'Upload vector resource',
                icon: <UploadVectorResourceIcon className="mr-2 h-4 w-4" />,
                onClick: () => {},
              },
              {
                name: 'Generate from document',
                icon: <GenerateDocIcon className="mr-2 h-4 w-4" />,
                onClick: () => {},
              },
              {
                name: 'Generate from Web',
                icon: <GenerateFromWebIcon className="mr-2 h-4 w-4" />,
                onClick: () => {},
              },
            ].map((item, index) => (
              <DropdownMenuItem key={index} onClick={item.onClick}>
                {item.icon}
                <span>{item.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-4 flex items-center gap-3">
        {prevActiveFileBranch.length > 0 && (
          <Button
            onClick={() => {
              setPrevActiveFileBranch((prev) => prev.slice(0, -1));
              setActiveFileBranch(
                prevActiveFileBranch[prevActiveFileBranch.length - 1] ?? [],
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
                <button className="flex items-center gap-2 py-2">
                  <HomeIcon />
                  Root
                </button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {prevActiveFileBranch.length > 0 &&
              prevActiveFileBranch.map((item, idx) => (
                <React.Fragment key={idx}>
                  <BreadcrumbSeparator>
                    <ChevronRight />
                  </BreadcrumbSeparator>
                  {prevActiveFileBranch.length - 1 === idx ? (
                    <BreadcrumbPage>
                      <button className="flex items-center gap-1">
                        <DirectoryTypeIcon />
                        {item.find((file) => file.selected)?.name}
                      </button>
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <button className="flex items-center gap-1">
                        <DirectoryTypeIcon />
                        {item.find((file) => file.selected)?.name}
                      </button>
                    </BreadcrumbLink>
                  )}
                </React.Fragment>
              ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <ScrollArea>
        <div className="flex flex-1 flex-col divide-y divide-gray-400">
          {activeFileBranch.map((file, index: number) => {
            return (
              <NodeFileItem
                file={file}
                key={index}
                onClick={() => {
                  if (file.type === 'folder') {
                    const newActiveFileBranch = [...activeFileBranch];
                    const index = newActiveFileBranch.indexOf(file);
                    newActiveFileBranch[index] = {
                      ...file,
                      selected: true,
                    };
                    setPrevActiveFileBranch((prev) => [
                      ...prev,
                      newActiveFileBranch,
                    ]);
                    setActiveFileBranch(file.items || []);
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

      <Button
        className="fixed bottom-4 right-4 h-[60px] w-[60px]"
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
        shouldScaleBackground={false}
      >
        <DrawerContent className="my-6">
          <DrawerClose className="absolute right-4 top-5">
            <XIcon className="text-gray-80" />
          </DrawerClose>
          <DrawerHeader>
            <DrawerTitle className={'sr-only'}>Information</DrawerTitle>
            <DrawerDescription>
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
                    {new Date(
                      activeFile?.creation_date ?? '',
                    ).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>{' '}
                  - <span>{activeFile?.size}</span>
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
                        {new Date(item.value ?? '').toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          },
                        )}
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
            </DrawerDescription>
          </DrawerHeader>

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
                - <span>{file.size}</span>
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
            - <span>{file.size}</span>
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
