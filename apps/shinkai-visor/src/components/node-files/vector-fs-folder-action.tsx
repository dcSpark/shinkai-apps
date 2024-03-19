import { HomeIcon } from '@radix-ui/react-icons';
import { useMoveVrFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/moveVRFolder/useUploadVRFiles';
import { VRFolder } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/types';
import { useGetVRPathSimplified } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/useGetVRPathSimplified';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  DirectoryTypeIcon,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  FileEmptyStateIcon,
  ScrollArea,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { ChevronRight, FolderInputIcon } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

import { useAuth } from '../../store/auth/auth';
import { Layout } from './node-files';
import { VectorFsFolderInfo } from './vector-fs-folder';

export const VectorFsFolderMoveAction = ({
  path,
  name,
  closeDrawer,
  setCurrentGlobalPath,
}: {
  path: string;
  name: string;
  closeDrawer: () => void;
  setCurrentGlobalPath: (path: string) => void;
}) => {
  const auth = useAuth((state) => state.auth);
  const [currentFolderPath, setCurrentFolderPath] = React.useState<string>('/');
  const [destinationFolder, setDestinationFolder] =
    React.useState<VRFolder | null>(null);

  const { mutateAsync: moveVrFolder, isPending: isMovingVrFolder } =
    useMoveVrFolder({
      onSuccess: () => {
        setCurrentGlobalPath(destinationFolder?.path ?? '/');
        closeDrawer();
        toast.success('Folder moved successfully');
      },
      onError: () => {
        toast.error('Failed to move folder');
      },
    });

  const {
    isPending: isVRFilesPending,
    data: VRFiles,
    isSuccess: isVRFilesSuccess,
  } = useGetVRPathSimplified({
    nodeAddress: auth?.node_address ?? '',
    profile: auth?.profile ?? '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    path: currentFolderPath,
    my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
    my_device_identity_sk: auth?.profile_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const splitCurrentPath = VRFiles?.path?.split('/').filter(Boolean) ?? [];

  return (
    <React.Fragment>
      <DrawerHeader>
        <DrawerTitle className="flex flex-col items-start gap-1">
          <FolderInputIcon className="h-10 w-10" />
          Move {name} to ...
        </DrawerTitle>
      </DrawerHeader>
      <div className="space-y-2 py-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <button
                  className={cn(
                    'flex items-center gap-2 rounded-full p-2 hover:bg-gray-400',
                    currentFolderPath === '/' && 'text-white',
                  )}
                  onClick={() => {
                    setCurrentFolderPath('/');
                    setDestinationFolder(null);
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
                {splitCurrentPath.length - 1 === idx && !destinationFolder ? (
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
                        setCurrentFolderPath('/' + buildPath);
                        setDestinationFolder(null);
                      }}
                    >
                      {path}
                    </button>
                  </BreadcrumbLink>
                )}
              </React.Fragment>
            ))}
            {destinationFolder && (
              <React.Fragment>
                <BreadcrumbSeparator>
                  <ChevronRight />
                </BreadcrumbSeparator>
                <BreadcrumbPage className="flex items-center gap-1 p-2 font-medium">
                  {destinationFolder.name}
                </BreadcrumbPage>
              </React.Fragment>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <ScrollArea className="min-h-[300px]">
          <div
            className={cn('grid flex-1 grid-cols-1 divide-y divide-gray-200')}
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
                <button
                  className={cn(
                    'flex items-center justify-between gap-2 py-3.5 hover:bg-gray-400',
                    'rounded-lg bg-gray-400/30 p-2',
                    destinationFolder?.path === folder.path && 'bg-gray-400',
                  )}
                  onClick={() => {
                    if (folder.child_folders?.length > 0) {
                      setCurrentFolderPath(folder.path);
                    } else {
                      setDestinationFolder(folder);
                    }
                  }}
                >
                  <DirectoryTypeIcon />
                  <VectorFsFolderInfo
                    allowFolderNameOnly
                    folder={folder}
                    layout={Layout.List}
                  />
                  {!!folder.child_folders?.length && (
                    <button>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <DrawerFooter>
        <Button
          className="mt-4"
          disabled={destinationFolder?.path === path}
          isLoading={isMovingVrFolder}
          onClick={async () => {
            await moveVrFolder({
              nodeAddress: auth?.node_address ?? '',
              shinkaiIdentity: auth?.shinkai_identity ?? '',
              profile: auth?.profile ?? '',
              originPath: path,
              destinationPath: destinationFolder?.path ?? '/',
              my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
              my_device_identity_sk: auth?.profile_identity_sk ?? '',
              node_encryption_pk: auth?.node_encryption_pk ?? '',
              profile_encryption_sk: auth?.profile_encryption_sk ?? '',
              profile_identity_sk: auth?.profile_identity_sk ?? '',
            });
          }}
        >
          Move
        </Button>
      </DrawerFooter>
    </React.Fragment>
  );
};
