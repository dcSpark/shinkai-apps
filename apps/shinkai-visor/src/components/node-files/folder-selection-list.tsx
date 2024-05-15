import { HomeIcon } from '@radix-ui/react-icons';
import { useGetVRPathSimplified } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/useGetVRPathSimplified';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  ScrollArea,
} from '@shinkai_network/shinkai-ui';
import { DirectoryTypeIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { ChevronRight } from 'lucide-react';
import React, { createContext, useContext, useRef } from 'react';
import { createStore, useStore } from 'zustand';

import { useAuth } from '../../store/auth/auth';
import { VectorFsFolderInfo } from './vector-fs-folder';

type VectorFolderSelectionList = {
  destinationFolderPath: string | null;
  setDestinationFolderPath: (folder: string | null) => void;
  currentSelectedFolderPath: string;
  setCurrentSelectedFolderPath: (path: string) => void;
};

const createVectorFsStore = () =>
  createStore<VectorFolderSelectionList>((set) => ({
    destinationFolderPath: null,
    setDestinationFolderPath: (destinationFolderPath) => {
      set({ destinationFolderPath });
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
  const destinationFolderPath = useVectorFolderSelectionStore(
    (state) => state.destinationFolderPath,
  );
  const setDestinationFolderPath = useVectorFolderSelectionStore(
    (state) => state.setDestinationFolderPath,
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

  const splitCurrentPath =
    destinationFolderPath?.split('/').filter(Boolean) ?? [];

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
                  setDestinationFolderPath('/');
                }}
                type="button"
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
              {idx === splitCurrentPath.length - 1 ? (
                <BreadcrumbPage className="flex items-center gap-1 p-2 font-medium">
                  {destinationFolderPath?.split('/')?.at(-1)}
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
                      setDestinationFolderPath(buildPath);
                    }}
                    type="button"
                  >
                    {path}
                  </button>
                </BreadcrumbLink>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <ScrollArea className="min-h-[300px]">
        <div
          className={cn(
            'grid flex-1 grid-cols-1 divide-y divide-gray-300 py-1',
          )}
        >
          {isVRFilesPending &&
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                className="mb-1 flex h-[69px] items-center justify-between gap-2 rounded-lg bg-gray-400 py-3"
                key={idx}
              />
            ))}
          {VRFiles?.child_folders.map((folder, index: number) => {
            return (
              <button
                className={cn(
                  'flex items-center justify-between gap-2 py-3.5 hover:bg-gray-300',
                  'rounded-md p-2',
                  destinationFolderPath === folder.path && 'bg-gray-300',
                )}
                key={folder.path}
                onClick={() => {
                  if (folder.child_folders?.length > 0) {
                    setCurrentSelectedFolderPath(folder.path);
                    setDestinationFolderPath(folder.path);
                  } else {
                    setDestinationFolderPath(folder.path);
                  }
                }}
                type="button"
              >
                <DirectoryTypeIcon />
                <VectorFsFolderInfo allowFolderNameOnly folder={folder} />
                {!!folder.child_folders?.length && (
                  <ChevronRight className="text-gray-80 h-5 w-5" />
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
