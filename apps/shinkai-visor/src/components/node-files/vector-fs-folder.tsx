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

  // const renderDrawerContent = (selectedOption: VectorFsFolderAction | null) => {
  //   switch (selectedOption) {
  //     case VectorFsFolderAction.Rename:
  //       return (
  //         <React.Fragment>
  //           <DrawerHeader>
  //             <DrawerTitle className="flex flex-col items-start gap-1">
  //               <DirectoryTypeIcon className="h-10 w-10" />
  //               Rename Folder
  //             </DrawerTitle>
  //           </DrawerHeader>
  //           <input
  //             className="w-full rounded-md border-0 bg-gray-500/30 p-2"
  //             placeholder="Folder name"
  //             type="text"
  //           />
  //           <DrawerFooter>
  //             <Button
  //               className="mt-4"
  //               onClick={async () => {
  //                 await moveFolderVR(
  //                   auth?.node_address ?? '',
  //                   auth?.shinkai_identity ?? '',
  //                   auth?.profile ?? '',
  //                   auth?.shinkai_identity ?? '',
  //                   auth?.profile ?? '',
  //                   '/personal/finances',
  //                   '/',
  //                   {
  //                     my_device_encryption_sk:
  //                       auth?.my_device_encryption_sk ?? '',
  //                     my_device_identity_sk: auth?.my_device_identity_sk ?? '',
  //                     node_encryption_pk: auth?.node_encryption_pk ?? '',
  //                     profile_encryption_sk: auth?.profile_encryption_sk ?? '',
  //                     profile_identity_sk: auth?.profile_identity_sk ?? '',
  //                   },
  //                 );
  //               }}
  //             >
  //               Rename
  //             </Button>
  //           </DrawerFooter>
  //         </React.Fragment>
  //       );
  //     case VectorFsFolderAction.Move:
  //       return (
  //         <VectorFsFolderMoveAction
  //           closeDrawer={() => {
  //             setSelectedOption(null);
  //           }}
  //           name={folder.name}
  //           path={folder.path}
  //         />
  //       );
  //     case VectorFsFolderAction.Share:
  //       return (
  //         <React.Fragment>
  //           <DrawerHeader>
  //             <DrawerTitle className="flex flex-col items-start gap-1">
  //               <DirectoryTypeIcon className="h-10 w-10" />
  //               Share Folder
  //             </DrawerTitle>
  //           </DrawerHeader>
  //           <p className="text-gray-100">
  //             Share this folder with other users or groups.
  //           </p>
  //           <DrawerFooter>
  //             <Button className="mt-4">Share</Button>
  //           </DrawerFooter>
  //         </React.Fragment>
  //       );
  //     case VectorFsFolderAction.Delete:
  //       return (
  //         <React.Fragment>
  //           <DrawerHeader>
  //             <DrawerTitle className="flex flex-col items-start gap-1">
  //               <DirectoryTypeIcon className="h-10 w-10" />
  //               Delete Folder
  //             </DrawerTitle>
  //           </DrawerHeader>
  //           <p className="text-gray-100">
  //             Are you sure you want to delete this folder? This action cannot be
  //             undone.
  //           </p>
  //           <DrawerFooter>
  //             <Button className="mt-4">Delete</Button>
  //           </DrawerFooter>
  //         </React.Fragment>
  //       );
  //     default:
  //       return null;
  //   }
  // };

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
                name: 'Rename',
                icon: <PencilLine className="mr-3 h-4 w-4" />,
                onClick: () => {
                  setActiveDrawerMenuOption(VectorFsFolderAction.Rename);
                },
              },
              {
                name: 'Move',
                icon: <FolderInputIcon className="mr-3 h-4 w-4" />,
                onClick: () => {
                  setActiveDrawerMenuOption(VectorFsFolderAction.Move);
                },
              },
              {
                name: 'Share',
                icon: <Share2Icon className="mr-3 h-4 w-4" />,
                onClick: () => {
                  setActiveDrawerMenuOption(VectorFsFolderAction.Share);
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
