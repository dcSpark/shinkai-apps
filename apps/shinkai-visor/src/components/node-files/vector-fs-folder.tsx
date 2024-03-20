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
  CopyIcon,
  FolderInputIcon,
  // Share2Icon,
  TrashIcon,
} from 'lucide-react';
import React from 'react';

import { formatDateToLocaleString } from '../../helpers/date';
import { useVectorFsStore, VectorFSLayout } from './node-file-context';
import { VectorFsFolderAction } from './vector-fs-drawer';

export const VectorFsFolderInfo = ({
  folder,
  totalItem,
  allowFolderNameOnly,
}: {
  folder: VRFolder;
  totalItem?: number;
  allowFolderNameOnly?: boolean;
}) => {
  const layout = useVectorFsStore((state) => state.layout);

  return (
    <div className="flex-1 text-left">
      <div className="truncate text-sm font-medium">{folder.name}</div>
      {layout === VectorFSLayout.List && !allowFolderNameOnly && (
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
  handleSelectFolders,
  isSelectedFolder,
  setCurrentGlobalPath,
}: {
  onClick: () => void;
  folder: VRFolder;
  handleSelectFolders: (folder: VRFolder) => void;
  isSelectedFolder: boolean;
  setCurrentGlobalPath: (path: string) => void;
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
  const totalItem =
    (folder.child_folders?.length ?? 0) + (folder.child_items?.length ?? 0);

  if (isVRSelectionActive) {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-3 rounded-md py-3.5 hover:bg-gray-400',
          layout === VectorFSLayout.Grid && 'rounded-lg bg-gray-400/30 p-2',
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
          <VectorFsFolderInfo folder={folder} totalItem={totalItem} />
        </label>
      </div>
    );
  }

  return (
    <React.Fragment>
      <button
        className={cn(
          'flex items-center justify-between gap-2 py-3.5 hover:bg-gray-400',
          layout === VectorFSLayout.Grid && 'rounded-lg bg-gray-400/30 p-2',
        )}
        onClick={onClick}
      >
        <DirectoryTypeIcon />
        <VectorFsFolderInfo folder={folder} totalItem={totalItem} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="border-0 hover:bg-gray-500/40"
              onClick={(event) => {
                event.stopPropagation();
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
              // {
              //   name: 'Share',
              //   icon: <Share2Icon className="mr-3 h-4 w-4" />,
              //   onClick: () => {
              //     setActiveDrawerMenuOption(VectorFsFolderAction.Share);
              //   },
              // },
              {
                name: 'Delete',
                icon: <TrashIcon className="mr-3 h-4 w-4" />,
                onClick: () => {
                  setActiveDrawerMenuOption(VectorFsFolderAction.Delete);
                },
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
      {/*<Drawer*/}
      {/*  onOpenChange={(open) => {*/}
      {/*    if (!open) {*/}
      {/*      setSelectedOption(null);*/}
      {/*    }*/}
      {/*  }}*/}
      {/*  open={!!selectedOption}*/}
      {/*>*/}
      {/*  <DrawerContent>*/}
      {/*    <DrawerClose className="absolute right-4 top-5">*/}
      {/*      <XIcon className="text-gray-80" />*/}
      {/*    </DrawerClose>*/}
      {/*    <VectorFolderSelectionProvider>*/}
      {/*      {renderDrawerContent(selectedOption)}*/}
      {/*    </VectorFolderSelectionProvider>*/}
      {/*  </DrawerContent>*/}
      {/*</Drawer>*/}
    </React.Fragment>
  );
};

export default VectorFsFolder;
