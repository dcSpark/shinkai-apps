import {
  Drawer,
  DrawerClose,
  DrawerContent,
} from '@shinkai_network/shinkai-ui';
import { XIcon } from 'lucide-react';
import React from 'react';

import { VectorFolderSelectionProvider } from './folder-selection-list';
import { useVectorFsStore } from './node-file-context';
import {
  AddNewFolderDrawer,
  UploadVRFilesDrawer,
  VectorFileDetails,
} from './node-files';
import {
  VectorFsFolderDeleteAction,
  VectorFsFolderMoveAction,
} from './vector-fs-folder-options';

const VectorFSDrawer = () => {
  const activeDrawerMenuOption = useVectorFsStore(
    (state) => state.activeDrawerMenuOption,
  );
  const setActiveDrawerMenuOption = useVectorFsStore(
    (state) => state.setActiveDrawerMenuOption,
  );
  const setSelectedFolder = useVectorFsStore(
    (state) => state.setSelectedFolder,
  );
  const setSelectedFile = useVectorFsStore((state) => state.setSelectedFile);
  return (
    <Drawer
      onOpenChange={(open) => {
        if (!open) {
          setActiveDrawerMenuOption(null);
          setSelectedFolder(null);
          setSelectedFile(null);
        }
      }}
      open={!!activeDrawerMenuOption}
    >
      <DrawerContent>
        <DrawerClose className="absolute right-4 top-5">
          <XIcon className="text-gray-80" />
        </DrawerClose>
        <VectorFolderSelectionProvider>
          <VectorFSDrawerContent selectedOption={activeDrawerMenuOption} />
        </VectorFolderSelectionProvider>
      </DrawerContent>
    </Drawer>
  );
};
export enum VectorFsGlobalAction {
  NewFolder = 'new-folder',
  // UploadVectorResource = 'upload-vector-resource',
  GenerateFromDocument = 'generate-from-document',
  // GenerateFromWeb = 'generate-from-web',
  VectorFileDetails = 'vector-file-details',
}

export enum VectorFsFolderAction {
  Rename = 'Rename',
  Move = 'Move',
  Share = 'Share',
  Delete = 'Delete',
}

export type VectorFsActions = VectorFsGlobalAction | VectorFsFolderAction;

const VectorFSDrawerContent = ({
  selectedOption,
}: {
  selectedOption: VectorFsActions | null;
}) => {
  switch (selectedOption) {
    case VectorFsGlobalAction.VectorFileDetails:
      return <VectorFileDetails />;
    case VectorFsGlobalAction.NewFolder:
      return <AddNewFolderDrawer />;
    case VectorFsGlobalAction.GenerateFromDocument:
      return <UploadVRFilesDrawer />;
    //folder actions
    case VectorFsFolderAction.Move:
      return <VectorFsFolderMoveAction />;
    case VectorFsFolderAction.Rename:
      return 'Rename';
    case VectorFsFolderAction.Share:
      return 'Share';
    case VectorFsFolderAction.Delete:
      return <VectorFsFolderDeleteAction />;

    default:
      return null;
  }
};

export default VectorFSDrawer;
