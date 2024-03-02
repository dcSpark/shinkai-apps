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
  DrawerTrigger,
  FileTypeIcon,
  ScrollArea,
} from '@shinkai_network/shinkai-ui';
import { ChevronLeft, ChevronRight, LockIcon } from 'lucide-react';
import React from 'react';

import { Header } from '../header/header';

export default function NodeFiles() {
  const { nodeFiles } = useGetNodeFiles();
  const prevActiveFileBranch = React.useRef<NodeFile[][]>([]);
  const [activeFileBranch, setActiveFileBranch] = React.useState<NodeFile[]>(
    [],
  );
  const [activeFile, setActiveFile] = React.useState<NodeFile | null>(null);

  React.useEffect(() => {
    setActiveFileBranch(nodeFiles ?? []);
  }, [nodeFiles]);

  return (
    <div className="flex h-full flex-col space-y-3 overflow-hidden">
      <Header title={'Node Files'} />
      {prevActiveFileBranch.current.length > 0 && (
        <Button
          onClick={() => {
            setActiveFileBranch(prevActiveFileBranch.current.pop() || []);
          }}
          size={'icon'}
          variant="ghost"
        >
          <ChevronLeft />
        </Button>
      )}
      <ScrollArea>
        <div className="flex flex-1 flex-col divide-y divide-gray-400">
          {activeFileBranch.map((file, index: number) => {
            return (
              <button
                className="flex items-center justify-between gap-2 py-3 hover:bg-gray-400"
                key={index}
                onClick={() => {
                  if (file.type === 'folder') {
                    prevActiveFileBranch.current.push(activeFileBranch);
                    setActiveFileBranch(file.items || []);
                  } else {
                    setActiveFile(file);
                  }
                }}
              >
                <div>
                  {file.type === 'folder' ? (
                    <DirectoryTypeIcon />
                  ) : (
                    <FileTypeIcon />
                  )}
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
                        {new Date(file.creation_date).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          },
                        )}
                      </span>{' '}
                      - <span>{file.size}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-100">
                      <span>
                        {new Date(file.creation_date).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          },
                        )}
                      </span>{' '}
                      - <span>{file?.items?.length} files</span>
                    </p>
                  )}
                </div>
                <ChevronRight />
              </button>
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
                      <span className="text-gray-100">Created</span>
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
