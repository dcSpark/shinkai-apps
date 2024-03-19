import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { VRFolder } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/types';
import {
  Button,
  Checkbox,
  DirectoryTypeIcon,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import {
  FolderInputIcon,
  PencilLine,
  Share2Icon,
  TrashIcon,
} from 'lucide-react';
import React from 'react';

import { formatDateToLocaleString } from '../../helpers/date';
import { Layout } from './node-files';

const VectorFsFolderInfo = ({
  folder,
  layout,
  totalItem,
}: {
  folder: VRFolder;
  layout: Layout;
  totalItem: number;
}) => {
  return (
    <div className="flex-1 text-left">
      <div className="truncate text-sm font-medium">{folder.name}</div>
      {layout === Layout.List && (
        <p className="text-xs font-medium text-gray-100">
          <span>{formatDateToLocaleString(folder.created_datetime)}</span> -{' '}
          <span>{totalItem} items</span>
        </p>
      )}
    </div>
  );
};
const VectorFsFolder = ({
  onClick,
  folder,
  selectionMode,
  handleSelectFolders,
  isSelectedFolder,
  layout,
}: {
  onClick: () => void;
  folder: VRFolder;
  selectionMode: boolean;
  handleSelectFolders: (folder: VRFolder) => void;
  isSelectedFolder: boolean;
  layout: Layout;
}) => {
  const totalItem =
    (folder.child_folders?.length ?? 0) + (folder.child_items?.length ?? 0);

  if (selectionMode) {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-3 rounded-md py-3.5 hover:bg-gray-400',
          layout === Layout.Grid && 'rounded-lg bg-gray-400/30 p-2',
        )}
      >
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
          <DirectoryTypeIcon />
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
    <button
      className={cn(
        'flex items-center justify-between gap-2 py-3.5 hover:bg-gray-400',
        layout === Layout.Grid && 'rounded-lg bg-gray-400/30 p-2',
      )}
      onClick={onClick}
    >
      <DirectoryTypeIcon />
      <VectorFsFolderInfo
        folder={folder}
        layout={layout}
        totalItem={totalItem}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="border-0"
            onClick={(event) => {
              event.stopPropagation();
              console.log('click');
            }}
            size="icon"
            variant="tertiary"
          >
            <span className="sr-only">More options</span>
            <DotsVerticalIcon className="text-gray-100" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[160px] border bg-gray-500 px-2.5 py-2"
        >
          {[
            {
              name: 'Rename',
              icon: <PencilLine className="mr-3 h-4 w-4" />,
              onClick: () => {},
            },
            {
              name: 'Move',
              icon: <FolderInputIcon className="mr-3 h-4 w-4" />,
              onClick: () => {},
            },
            {
              name: 'Share',
              icon: <Share2Icon className="mr-3 h-4 w-4" />,
              onClick: () => {},
            },
            {
              name: 'Delete',
              icon: <TrashIcon className="mr-3 h-4 w-4" />,
              onClick: () => {},
            },
          ].map((option) => (
            <React.Fragment key={option.name}>
              {option.name === 'Delete' && (
                <DropdownMenuSeparator className="bg-gray-300" />
              )}
              <DropdownMenuItem
                key={option.name}
                onClick={(event) => {
                  event.stopPropagation();
                  option.onClick();
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
