import { NodeFile } from '@shinkai_network/shinkai-node-state/lib/queries/getNodeFiles/types';
import { useGetNodeFiles } from '@shinkai_network/shinkai-node-state/lib/queries/getNodeFiles/useGetNodeFiles';
import {
  Badge,
  Button,
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
  Input,
  ScrollArea,
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
  const prevActiveFileBranch = React.useRef<NodeFile[][]>([]);
  const [activeFileBranch, setActiveFileBranch] = React.useState<NodeFile[]>(
    [],
  );
  const [activeFile, setActiveFile] = React.useState<NodeFile | null>(null);

  const [querySearch, setQuerySearch] = React.useState('');
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
    <div className="flex h-full flex-col space-y-3 overflow-hidden">
      <div className="relative flex items-center justify-between" />
      <Header title={'Node Files'} />
      <div className="flex items-center gap-3">
        <Button
          disabled={prevActiveFileBranch.current.length > 0}
          onClick={() => {
            setActiveFileBranch(prevActiveFileBranch.current.pop() || []);
          }}
          size={'icon'}
          variant="ghost"
        >
          <ChevronLeft />
        </Button>

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
            <DropdownMenuItem>
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                height="24"
                viewBox="0 0 24 24"
                width="24"
              >
                <path
                  d="M4.25 4C3.01625 4 2 5.01625 2 6.25V17.75C2 18.9838 3.01625 20 4.25 20H19.75C20.9838 20 22 18.9838 22 17.75V8.75C22 7.51625 20.9838 6.5 19.75 6.5H12.0215L9.78613 4.6377C9.29203 4.22606 8.66958 4 8.02637 4H4.25ZM4.25 5.5H8.02637C8.31915 5.5 8.60128 5.60268 8.82617 5.79004L10.5781 7.25L8.82617 8.70996C8.60128 8.89732 8.31915 9 8.02637 9H3.5V6.25C3.5 5.82675 3.82675 5.5 4.25 5.5ZM12.0215 8H19.75C20.1733 8 20.5 8.32675 20.5 8.75V17.75C20.5 18.1733 20.1733 18.5 19.75 18.5H4.25C3.82675 18.5 3.5 18.1733 3.5 17.75V10.5H8.02637C8.66958 10.5 9.29203 10.2739 9.78613 9.86231L12.0215 8Z"
                  fill="white"
                />
              </svg>

              <span>Add new folder</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                height="24"
                viewBox="0 0 24 24"
                width="24"
              >
                <path
                  d="M11.9893 3.00007C11.7941 3.00293 11.6077 3.08175 11.4697 3.2198L8.46973 6.2198C8.39775 6.28891 8.34028 6.37169 8.3007 6.46328C8.26111 6.55488 8.24019 6.65345 8.23918 6.75323C8.23817 6.85301 8.25707 6.95199 8.29479 7.04437C8.33251 7.13675 8.38828 7.22068 8.45883 7.29124C8.52939 7.3618 8.61332 7.41757 8.7057 7.45529C8.79808 7.493 8.89706 7.51191 8.99684 7.51089C9.09662 7.50988 9.1952 7.48897 9.28679 7.44938C9.37839 7.40979 9.46116 7.35233 9.53027 7.28035L11.25 5.56062V16.2501C11.2486 16.3495 11.267 16.4481 11.304 16.5404C11.3411 16.6326 11.3961 16.7165 11.4659 16.7873C11.5357 16.8581 11.6188 16.9143 11.7105 16.9526C11.8022 16.991 11.9006 17.0108 12 17.0108C12.0994 17.0108 12.1978 16.991 12.2895 16.9526C12.3812 16.9143 12.4643 16.8581 12.5341 16.7873C12.6039 16.7165 12.6589 16.6326 12.696 16.5404C12.733 16.4481 12.7514 16.3495 12.75 16.2501V5.56062L14.4697 7.28035C14.5388 7.35233 14.6216 7.40979 14.7132 7.44938C14.8048 7.48897 14.9034 7.50988 15.0032 7.51089C15.1029 7.51191 15.2019 7.493 15.2943 7.45529C15.3867 7.41757 15.4706 7.3618 15.5412 7.29124C15.6117 7.22068 15.6675 7.13675 15.7052 7.04437C15.7429 6.95199 15.7618 6.85301 15.7608 6.75323C15.7598 6.65345 15.7389 6.55488 15.6993 6.46328C15.6597 6.37169 15.6023 6.28891 15.5303 6.2198L12.5303 3.2198C12.4594 3.14886 12.375 3.09287 12.282 3.05513C12.1891 3.01739 12.0895 2.99867 11.9893 3.00007ZM5.75 8.50007C4.24011 8.50007 3 9.74019 3 11.2501V18.2501C3 19.76 4.24011 21.0001 5.75 21.0001H18.25C19.7599 21.0001 21 19.76 21 18.2501V11.2501C21 9.74019 19.7599 8.50007 18.25 8.50007H17.25C17.1506 8.49867 17.0519 8.51703 16.9597 8.55409C16.8675 8.59115 16.7836 8.64617 16.7128 8.71595C16.642 8.78574 16.5858 8.86889 16.5474 8.96058C16.5091 9.05228 16.4893 9.15068 16.4893 9.25007C16.4893 9.34947 16.5091 9.44787 16.5474 9.53956C16.5858 9.63126 16.642 9.71441 16.7128 9.78419C16.7836 9.85398 16.8675 9.909 16.9597 9.94606C17.0519 9.98312 17.1506 10.0015 17.25 10.0001H18.25C18.9491 10.0001 19.5 10.551 19.5 11.2501V18.2501C19.5 18.9492 18.9491 19.5001 18.25 19.5001H5.75C5.05089 19.5001 4.5 18.9492 4.5 18.2501V11.2501C4.5 10.551 5.05089 10.0001 5.75 10.0001H6.75C6.84938 10.0015 6.94806 9.98312 7.04028 9.94606C7.13251 9.909 7.21645 9.85398 7.28723 9.78419C7.358 9.71441 7.41421 9.63126 7.45257 9.53956C7.49093 9.44787 7.51068 9.34947 7.51068 9.25007C7.51068 9.15068 7.49093 9.05228 7.45257 8.96058C7.41421 8.86889 7.358 8.78574 7.28723 8.71595C7.21645 8.64617 7.13251 8.59115 7.04028 8.55409C6.94806 8.51703 6.84938 8.49867 6.75 8.50007H5.75Z"
                  fill="white"
                />
              </svg>

              <span>Upload vector resource</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                height="24"
                viewBox="0 0 24 24"
                width="24"
              >
                <path
                  d="M6.25 1.99988C5.01625 1.99988 4 3.01613 4 4.24988V19.7499C4 20.9836 5.01625 21.9999 6.25 21.9999H17.75C18.9838 21.9999 20 20.9836 20 19.7499V9.24988C20 9.05098 19.9209 8.86024 19.7803 8.7196L19.7725 8.71179L13.2803 2.2196C13.1396 2.07895 12.9489 1.99992 12.75 1.99988H6.25ZM6.25 3.49988H12V7.74988C12 8.98363 13.0163 9.99988 14.25 9.99988H18.5V19.7499C18.5 20.1731 18.1733 20.4999 17.75 20.4999H6.25C5.82675 20.4999 5.5 20.1731 5.5 19.7499V4.24988C5.5 3.82663 5.82675 3.49988 6.25 3.49988ZM13.5 4.56042L17.4395 8.49988H14.25C13.8268 8.49988 13.5 8.17313 13.5 7.74988V4.56042ZM8.75 12.4999C8.65062 12.4985 8.55194 12.5168 8.45972 12.5539C8.36749 12.591 8.28355 12.646 8.21277 12.7158C8.142 12.7855 8.08579 12.8687 8.04743 12.9604C8.00907 13.0521 7.98932 13.1505 7.98932 13.2499C7.98932 13.3493 8.00907 13.4477 8.04743 13.5394C8.08579 13.6311 8.142 13.7142 8.21277 13.784C8.28355 13.8538 8.36749 13.9088 8.45972 13.9459C8.55194 13.9829 8.65062 14.0013 8.75 13.9999H15.25C15.3494 14.0013 15.4481 13.9829 15.5403 13.9459C15.6325 13.9088 15.7165 13.8538 15.7872 13.784C15.858 13.7142 15.9142 13.6311 15.9526 13.5394C15.9909 13.4477 16.0107 13.3493 16.0107 13.2499C16.0107 13.1505 15.9909 13.0521 15.9526 12.9604C15.9142 12.8687 15.858 12.7855 15.7872 12.7158C15.7165 12.646 15.6325 12.591 15.5403 12.5539C15.4481 12.5168 15.3494 12.4985 15.25 12.4999H8.75ZM8.75 15.9999C8.65062 15.9985 8.55194 16.0168 8.45972 16.0539C8.36749 16.091 8.28355 16.146 8.21277 16.2158C8.142 16.2855 8.08579 16.3687 8.04743 16.4604C8.00907 16.5521 7.98932 16.6505 7.98932 16.7499C7.98932 16.8493 8.00907 16.9477 8.04743 17.0394C8.08579 17.1311 8.142 17.2142 8.21277 17.284C8.28355 17.3538 8.36749 17.4088 8.45972 17.4459C8.55194 17.4829 8.65062 17.5013 8.75 17.4999H13.25C13.3494 17.5013 13.4481 17.4829 13.5403 17.4459C13.6325 17.4088 13.7165 17.3538 13.7872 17.284C13.858 17.2142 13.9142 17.1311 13.9526 17.0394C13.9909 16.9477 14.0107 16.8493 14.0107 16.7499C14.0107 16.6505 13.9909 16.5521 13.9526 16.4604C13.9142 16.3687 13.858 16.2855 13.7872 16.2158C13.7165 16.146 13.6325 16.091 13.5403 16.0539C13.4481 16.0168 13.3494 15.9985 13.25 15.9999H8.75Z"
                  fill="white"
                />
              </svg>

              <span>Generate from document</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                height="24"
                viewBox="0 0 24 24"
                width="24"
              >
                <path
                  d="M12 2C6.48603 2 2 6.48604 2 12C2 17.514 6.48603 22 12 22C17.514 22 22 17.514 22 12C22 6.48604 17.514 2 12 2ZM12 3.5C12.3663 3.5 12.7382 3.65246 13.1465 4.02832C13.5548 4.40418 13.9689 5.00126 14.3232 5.77246C14.6082 6.39276 14.8184 7.18813 15.0107 8H8.98926C9.18155 7.18813 9.39175 6.39276 9.67676 5.77246C10.0311 5.00126 10.4452 4.40418 10.8535 4.02832C11.2618 3.65246 11.6337 3.5 12 3.5ZM8.88867 4.09375C8.68188 4.41868 8.48809 4.76644 8.31348 5.14648C7.93297 5.97464 7.64747 6.95491 7.42578 8H4.49805C5.44372 6.22596 7.00017 4.83523 8.88867 4.09375ZM15.1113 4.09375C16.9998 4.83523 18.5563 6.22596 19.502 8H16.5742C16.3525 6.95491 16.067 5.97464 15.6865 5.14648C15.5119 4.76644 15.3181 4.41868 15.1113 4.09375ZM3.87402 9.5H7.23047C7.12772 10.3161 7 11.1159 7 12C7 12.8841 7.12771 13.6839 7.23047 14.5H3.87402C3.63216 13.7098 3.5 12.8706 3.5 12C3.5 11.1294 3.63216 10.2902 3.87402 9.5ZM8.7334 9.5H15.2666C15.3781 10.3067 15.5 11.1103 15.5 12C15.5 12.8897 15.3781 13.6933 15.2666 14.5H8.7334C8.62189 13.6933 8.5 12.8897 8.5 12C8.5 11.1103 8.62189 10.3067 8.7334 9.5ZM16.7695 9.5H20.126C20.3678 10.2902 20.5 11.1294 20.5 12C20.5 12.8706 20.3678 13.7098 20.126 14.5H16.7695C16.8723 13.6839 17 12.8841 17 12C17 11.1159 16.8723 10.3161 16.7695 9.5ZM4.49805 16H7.42578C7.64747 17.0451 7.93297 18.0254 8.31348 18.8535C8.48809 19.2336 8.68188 19.5813 8.88867 19.9062C7.00017 19.1648 5.44372 17.774 4.49805 16ZM8.98926 16H15.0107C14.8184 16.8119 14.6082 17.6072 14.3232 18.2275C13.9689 18.9987 13.5548 19.5958 13.1465 19.9717C12.7382 20.3475 12.3663 20.5 12 20.5C11.6337 20.5 11.2618 20.3475 10.8535 19.9717C10.4452 19.5958 10.0311 18.9987 9.67676 18.2275C9.39175 17.6072 9.18155 16.8119 8.98926 16ZM16.5742 16H19.502C18.5563 17.774 16.9998 19.1648 15.1113 19.9062C15.3181 19.5813 15.5119 19.2336 15.6865 18.8535C16.067 18.0254 16.3525 17.0451 16.5742 16Z"
                  fill="white"
                />
              </svg>

              <span>Generate from Web</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea>
        <div className="flex flex-1 flex-col divide-y divide-gray-400">
          {filteredFiles.map((file, index: number) => {
            return (
              <NodeFileItem
                file={file}
                key={index}
                onClick={() => {
                  if (file.type === 'folder') {
                    prevActiveFileBranch.current.push(filteredFiles);
                    setActiveFileBranch(file.items || []);
                  } else {
                    setActiveFile(file);
                  }
                }}
              />
            );
          })}
        </div>
      </ScrollArea>

      <Drawer
        onOpenChange={(open) => {
          if (!open) {
            setActiveFile(null);
          }
        }}
        open={!!activeFile}
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
}: {
  file: NodeFile;
  onClick: () => void;
}) => {
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
