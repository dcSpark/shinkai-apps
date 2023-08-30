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
  VectorFsFolderCopyAction,
  VectorFsFolderCreateShareableAction,
  VectorFsFolderDeleteAction,
  VectorFsFolderMoveAction,
  VectorFsFolderSearchKnowledgeAction,
  VectorFsFolderUnshareAction,
} from './vector-fs-folder-options';
import {
  AddNewFolderAction,
  SaveWebpageToVectorFsAction,
  UploadVRFilesAction,
} from './vector-fs-general-options';
import { VectorFileDetails } from './vector-fs-item-detail';
import {
  VectorFsItemCopyAction,
  VectorFsItemDeleteAction,
  VectorFsItemMoveAction,
} from './vector-fs-item-options';

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
  GenerateFromDocumentIncludeFolder = 'generate-from-document-include-folder',
}

export enum VectorFsFolderAction {
  // Rename = 'Rename',
  Move = 'move-folder',
  Copy = 'copy-folder',
  Delete = 'delete-folder',
  SearchKnowledge = 'search-knowledge-folder',
  CreateShareable = 'create-shareable-folder',
  Unshare = 'unshare-folder',
}

export enum VectorFsItemAction {
  Move = 'move-item',
  Copy = 'copy-item',
  Delete = 'delete-item',
}

export type VectorFsActions =
  | VectorFsGlobalAction
  | VectorFsFolderAction
  | VectorFsItemAction;

const VectorFSDrawerContent = ({
  selectedOption,
}: {
  selectedOption: VectorFsActions | null;
}) => {
  switch (selectedOption) {
    // global actions
    case VectorFsGlobalAction.VectorFileDetails:
      return <VectorFileDetails />;
    case VectorFsGlobalAction.NewFolder:
      return <AddNewFolderAction />;
    case VectorFsGlobalAction.GenerateFromDocument:
      return <UploadVRFilesAction />;
    case VectorFsGlobalAction.GenerateFromDocumentIncludeFolder:
      return <SaveWebpageToVectorFsAction />;

    // folder actions
    case VectorFsFolderAction.Move:
      return <VectorFsFolderMoveAction />;
    case VectorFsFolderAction.Copy:
      return <VectorFsFolderCopyAction />;
    case VectorFsFolderAction.Delete:
      return <VectorFsFolderDeleteAction />;
    case VectorFsFolderAction.SearchKnowledge:
      return <VectorFsFolderSearchKnowledgeAction />;
    case VectorFsFolderAction.CreateShareable:
      return <VectorFsFolderCreateShareableAction />;
    case VectorFsFolderAction.Unshare:
      return <VectorFsFolderUnshareAction />;

    // item actions
    case VectorFsItemAction.Move:
      return <VectorFsItemMoveAction />;
    case VectorFsItemAction.Copy:
      return <VectorFsItemCopyAction />;
    case VectorFsItemAction.Delete:
      return <VectorFsItemDeleteAction />;

    default:
      return null;
  }
};

export default VectorFSDrawer;
