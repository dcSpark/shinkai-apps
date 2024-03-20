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

const VectorFSDrawer = () => {
  const activeDrawerMenuOption = useVectorFsStore(
    (state) => state.activeDrawerMenuOption,
  );
  const setActiveDrawerMenuOption = useVectorFsStore(
    (state) => state.setActiveDrawerMenuOption,
  );
  return (
    <Drawer
      onOpenChange={(open) => {
        if (!open) {
          setActiveDrawerMenuOption(null);
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

const VectorFSDrawerContent = ({
  selectedOption,
}: {
  selectedOption: VectorFsGlobalAction | VectorFsFolderAction | null;
}) => {
  switch (selectedOption) {
    case VectorFsGlobalAction.VectorFileDetails:
      return <VectorFileDetails />;
    case VectorFsGlobalAction.NewFolder:
      return <AddNewFolderDrawer />;
    case VectorFsGlobalAction.GenerateFromDocument:
      return <UploadVRFilesDrawer />;
    default:
      return null;
  }
};

export default VectorFSDrawer;
