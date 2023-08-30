import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { VRFolder } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/types';
import {
  buttonVariants,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  AISearchContentIcon,
  DirectoryTypeIcon,
  SharedFolderIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { formatDateToUSLocaleString } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import {
  CopyIcon,
  FolderInputIcon,
  Share2,
  // Share2Icon,
  TrashIcon,
} from 'lucide-react';
import React from 'react';

import { useVectorFsStore, VectorFSLayout } from './node-file-context';
import { VectorFsFolderAction } from './vector-fs-drawer';

export const VectorFsFolderInfo = ({
  folder,
  totalItem,
  allowFolderNameOnly,
  layout,
}: {
  folder: VRFolder;
  totalItem?: number;
  allowFolderNameOnly?: boolean;
  layout?: VectorFSLayout;
}) => {
  return (
    <div className="flex-1 truncate text-left">
      <div className="truncate text-sm font-medium">{folder.name}</div>
      {layout === VectorFSLayout.List && !allowFolderNameOnly && (
        <p className="text-xs font-medium text-gray-100">
          <span>{formatDateToUSLocaleString(folder.created_datetime)}</span> -{' '}
          <span>{totalItem} items</span>
        </p>
      )}
    </div>
  );
};

const VectorFsFolder = ({
  onClick,
  folder,
  handleSelectFolders,
  isSelectedFolder,
  isSharedFolder,
}: {
  onClick: () => void;
  folder: VRFolder;
  handleSelectFolders: (folder: VRFolder) => void;
  isSelectedFolder: boolean;
  isSharedFolder?: boolean;
}) => {
  const setActiveDrawerMenuOption = useVectorFsStore(
    (state) => state.setActiveDrawerMenuOption,
  );
  const setSelectedFolder = useVectorFsStore(
    (state) => state.setSelectedFolder,
  );

  const layout = useVectorFsStore((state) => state.layout);
  const isVRSelectionActive = useVectorFsStore(
    (state) => state.isVRSelectionActive,
  );
  const wrapperClassName = cn(
    'flex items-center justify-between gap-2 truncate rounded-lg py-3.5 pr-2 hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-400',
    layout === VectorFSLayout.Grid && 'bg-gray-400/30 p-2',
  );
  const totalItem =
    (folder.child_folders?.length ?? 0) + (folder.child_items?.length ?? 0);

  const FolderIcon = isSharedFolder ? SharedFolderIcon : DirectoryTypeIcon;

  if (isVRSelectionActive) {
    return (
      <div className={wrapperClassName}>
        <Checkbox
          checked={isSelectedFolder}
          id={`item-${folder.name}`}
          onCheckedChange={() => {
            handleSelectFolders(folder);
          }}
        />
        <label
          className="flex flex-1 items-center gap-3"
          htmlFor={`item-${folder.name}`}
        >
          <FolderIcon />
          <VectorFsFolderInfo
            folder={folder}
            layout={layout}
            totalItem={totalItem}
          />
        </label>
      </div>
    );
  }

  return (
    <button className={wrapperClassName} onClick={onClick}>
      <FolderIcon />
      <VectorFsFolderInfo
        folder={folder}
        layout={layout}
        totalItem={totalItem}
      />
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
            <span className="sr-only">More options</span>
            <DotsVerticalIcon className="text-gray-100" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[160px] border bg-gray-500 px-2.5 py-2"
        >
          {[
            {
              name: 'Move',
              icon: <FolderInputIcon className="mr-3 h-4 w-4" />,
              onClick: () => {
                setActiveDrawerMenuOption(VectorFsFolderAction.Move);
              },
            },
            {
              name: 'Copy',
              icon: <CopyIcon className="mr-3 h-4 w-4" />,
              onClick: () => {
                setActiveDrawerMenuOption(VectorFsFolderAction.Copy);
              },
            },
            {
              name: 'Search within folder',
              icon: <AISearchContentIcon className="mr-3 h-4 w-4" />,
              onClick: () => {
                setActiveDrawerMenuOption(VectorFsFolderAction.SearchKnowledge);
              },
            },
            {
              name: 'Share',
              icon: <Share2 className="mr-3 h-4 w-4" />,
              onClick: () => {
                setActiveDrawerMenuOption(VectorFsFolderAction.CreateShareable);
              },
            },
            {
              name: 'Delete',
              icon: <TrashIcon className="mr-3 h-4 w-4" />,
              onClick: () => {
                setActiveDrawerMenuOption(VectorFsFolderAction.Delete);
              },
            },
          ].map((option) => (
            <React.Fragment key={option.name}>
              {(option.name === 'Share' ||
                option.name === 'Delete' ||
                option.name === 'Search within folder') && (
                <DropdownMenuSeparator className="bg-gray-300" />
              )}
              <DropdownMenuItem
                key={option.name}
                onClick={(event) => {
                  event.stopPropagation();
                  option.onClick();
                  setSelectedFolder(folder);
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
};

export default VectorFsFolder;
