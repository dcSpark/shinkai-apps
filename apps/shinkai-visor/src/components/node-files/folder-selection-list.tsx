import { HomeIcon } from '@radix-ui/react-icons';
import {
  VRFolder,
  VRItem,
} from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/types';
import { useGetVRPathSimplified } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/useGetVRPathSimplified';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  DirectoryTypeIcon,
  ScrollArea,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { ChevronRight } from 'lucide-react';
import React, { createContext, useContext, useRef } from 'react';
import { createStore, useStore } from 'zustand';

import { useAuth } from '../../store/auth/auth';
import { VectorFsFolderInfo } from './vector-fs-folder';

type VectorFolderSelectionList = {
  destinationFolder: VRFolder | null;
  setDestinationFolder: (folder: VRFolder | null) => void;
  currentSelectedFolderPath: string;
  setCurrentSelectedFolderPath: (path: string) => void;
};

const createVectorFsStore = () =>
  createStore<VectorFolderSelectionList>((set) => ({
    destinationFolder: null,
    setDestinationFolder: (destinationFolder) => {
      set({ destinationFolder });
    },
    currentSelectedFolderPath: '/',
    setCurrentSelectedFolderPath: (currentSelectedFolderPath) => {
      set({ currentSelectedFolderPath });
    },
  }));

const VectorFolderSelectionContext = createContext<ReturnType<
  typeof createVectorFsStore
> | null>(null);

export const VectorFolderSelectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const storeRef = useRef<ReturnType<typeof createVectorFsStore>>();
  if (!storeRef.current) {
    storeRef.current = createVectorFsStore();
  }
  return (
    <VectorFolderSelectionContext.Provider value={storeRef.current}>
      {children}
    </VectorFolderSelectionContext.Provider>
  );
};

export function useVectorFolderSelectionStore<T>(
  selector: (state: VectorFolderSelectionList) => T,
) {
  const store = useContext(VectorFolderSelectionContext);
  if (!store) {
    throw new Error('Missing VectorFolderSelectionProvider');
  }
  const value = useStore(store, selector);
  return value;
}

export const FolderSelectionList = () => {
  const auth = useAuth((state) => state.auth);
  const destinationFolder = useVectorFolderSelectionStore(
    (state) => state.destinationFolder,
  );
  const setDestinationFolder = useVectorFolderSelectionStore(
    (state) => state.setDestinationFolder,
  );
  const currentSelectedFolderPath = useVectorFolderSelectionStore(
    (state) => state.currentSelectedFolderPath,
  );
  const setCurrentSelectedFolderPath = useVectorFolderSelectionStore(
    (state) => state.setCurrentSelectedFolderPath,
  );

  const { isPending: isVRFilesPending, data: VRFiles } = useGetVRPathSimplified(
    {
      nodeAddress: auth?.node_address ?? '',
      profile: auth?.profile ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      path: currentSelectedFolderPath,
      my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
      my_device_identity_sk: auth?.profile_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    },
  );

  const splitCurrentPath = VRFiles?.path?.split('/').filter(Boolean) ?? [];
  return (
    <div className="space-y-2 py-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <button
                className={cn(
                  'flex items-center gap-2 rounded-full p-2 hover:bg-gray-400',
                  currentSelectedFolderPath === '/' && 'text-white',
                )}
                onClick={() => {
                  setCurrentSelectedFolderPath('/');
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
                      setCurrentSelectedFolderPath('/' + buildPath);
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
        <div className={cn('grid flex-1 grid-cols-1 divide-y divide-gray-200')}>
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
                key={folder.path}
                onClick={() => {
                  if (folder.child_folders?.length > 0) {
                    setCurrentSelectedFolderPath(folder.path);
                  } else {
                    setDestinationFolder(folder);
                  }
                }}
              >
                <DirectoryTypeIcon />
                <VectorFsFolderInfo allowFolderNameOnly folder={folder} />
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
  );
};
