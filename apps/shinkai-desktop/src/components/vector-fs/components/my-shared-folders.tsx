import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useGetMySharedFolders } from '@shinkai_network/shinkai-node-state/lib/queries/getMySharedFolders/useGetMySharedFolders';
import {
  buttonVariants,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  ScrollArea,
} from '@shinkai_network/shinkai-ui';
import { SharedFolderIcon } from '@shinkai_network/shinkai-ui/assets';
import { formatDateToUSLocaleString } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Link2Off } from 'lucide-react';
import React from 'react';

import { useAuth } from '../../../store/auth';
import { useVectorFsStore, VectorFSLayout } from '../context/vector-fs-context';
import { VectorFsFolderAction } from './vector-fs-drawer';
import VectorFsToggleLayout from './vector-fs-toggle-layout';

export default function MySharedFolders() {
  const { t } = useTranslation();
  const layout = useVectorFsStore((state) => state.layout);
  const auth = useAuth((state) => state.auth);
  const { data: sharedFolders, isSuccess } = useGetMySharedFolders({
    nodeAddress: auth?.node_address ?? '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  return (
    <React.Fragment>
      <div className="mb-4 flex justify-end">
        <VectorFsToggleLayout />
      </div>
      {isSuccess && !sharedFolders.length && (
        <p className="text-gray-80 text-center">
          {t('vectorFs.emptyState.noSharedFolders')}
        </p>
      )}
      {isSuccess && !!sharedFolders.length && (
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
            {sharedFolders?.map((folder) => (
              <SharedFolderItem
                key={folder.path}
                lastModified={formatDateToUSLocaleString(
                  new Date(folder?.tree?.last_modified ?? ''),
                )}
                name={folder.path.replace(/\//g, '')}
                path={folder.path}
                totalItems={Object.keys(folder.tree.children || {}).length}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </React.Fragment>
  );
}

function SharedFolderItem({
  name,
  lastModified,
  totalItems,
  path,
}: {
  name: string;
  lastModified: string;
  totalItems: number;
  path: string;
}) {
  const { t } = useTranslation();

  const setCurrentGlobalPath = useVectorFsStore(
    (state) => state.setCurrentGlobalPath,
  );
  const layout = useVectorFsStore((state) => state.layout);
  const setActiveDrawerMenuOption = useVectorFsStore(
    (state) => state.setActiveDrawerMenuOption,
  );
  const setSelectedFolder = useVectorFsStore(
    (state) => state.setSelectedFolder,
  );
  const setSelectedVectorFsTab = useVectorFsStore(
    (state) => state.setSelectedVectorFsTab,
  );

  return (
    <button
      className={cn(
        'flex items-center justify-between gap-2 truncate rounded-lg py-3.5 pr-2 hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-400',
        layout === VectorFSLayout.Grid && 'rounded-lg bg-gray-400/30 p-2',
      )}
      key={path}
      onClick={() => {
        setSelectedVectorFsTab('all');
        setCurrentGlobalPath(path);
      }}
      type="button"
    >
      <SharedFolderIcon />
      <div className="flex-1 truncate text-left">
        <div className="truncate text-sm font-medium">{name}</div>
        {layout === VectorFSLayout.List && (
          <p className="text-xs font-medium text-gray-100">
            <span>{lastModified}</span> - <span>{totalItems} items</span>
          </p>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            className={cn(
              buttonVariants({
                variant: 'tertiary',
                size: 'icon',
              }),
              'border-0 hover:bg-gray-500/40',
            )}
            onClick={(event) => {
              event.stopPropagation();
            }}
            role="button"
            tabIndex={0}
          >
            <span className="sr-only">{t('common.seeOptions')}</span>
            <DotsVerticalIcon className="text-gray-100" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[160px] border bg-gray-500 px-2.5 py-2"
        >
          {[
            {
              name: t('vectorFs.actions.unshare'),
              icon: <Link2Off className="mr-3 h-4 w-4" />,
              onClick: () => {
                setActiveDrawerMenuOption(VectorFsFolderAction.Unshare);
              },
            },
          ].map((option) => (
            <React.Fragment key={option.name}>
              <DropdownMenuItem
                key={option.name}
                onClick={(event) => {
                  event.stopPropagation();
                  option.onClick();
                  setSelectedFolder({
                    name,
                    path,
                    child_folders: [],
                    child_items: [],
                    created_datetime: new Date(lastModified),
                    last_written_datetime: new Date(lastModified),
                    last_modified_datetime: new Date(lastModified),
                    last_read_datetime: new Date(lastModified),
                    merkle_root: '',
                    merkle_hash: '',
                  });
                }}
              >
                {option.icon}
                {option.name}
              </DropdownMenuItem>
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </button>
  );
}
