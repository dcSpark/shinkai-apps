import { Sheet, SheetContent } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';

import { useVectorFsStore } from '../context/vector-fs-context';
import { VectorFolderSelectionProvider } from './folder-selection-list';
import {
  VectorFsFolderCopyAction,
  VectorFsFolderDeleteAction,
  VectorFsFolderMoveAction,
} from './vector-fs-folder-options';
import {
  AddNewFolderAction,
  CreateTextFileAction,
  SaveWebpageToVectorFsAction,
  UploadVRFilesAction,
} from './vector-fs-general-options';
import { VectorFileDetails } from './vector-fs-item-detail';
import {
  VectorFsItemCopyAction,
  VectorFsItemDeleteAction,
  VectorFsItemEditTextFileAction,
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
  console.log('activeDrawerMenuOption', activeDrawerMenuOption);
  return (
    <Sheet
      onOpenChange={(open) => {
        if (!open) {
          setActiveDrawerMenuOption(null);
          setSelectedFolder(null);
          setSelectedFile(null);
        }
      }}
      open={!!activeDrawerMenuOption}
    >
      <SheetContent
        className={cn(
          activeDrawerMenuOption === VectorFsGlobalAction.CreateTextFile ||
          activeDrawerMenuOption === VectorFsItemAction.Edit
            ? 'max-w-[85%]'
            : 'max-w-md',
        )}
      >
        <VectorFolderSelectionProvider>
          <VectorFSDrawerContent selectedOption={activeDrawerMenuOption} />
        </VectorFolderSelectionProvider>
      </SheetContent>
    </Sheet>
  );
};
export enum VectorFsGlobalAction {
  NewFolder = 'new-folder',
  // UploadVectorResource = 'upload-vector-resource',
  GenerateFromDocument = 'generate-from-document',
  // GenerateFromWeb = 'generate-from-web',
  VectorFileDetails = 'vector-file-details',
  GenerateFromDocumentIncludeFolder = 'generate-from-document-include-folder',
  CreateTextFile = 'create-text-file',
}

export enum VectorFsFolderAction {
  // Rename = 'Rename',
  Move = 'move-folder',
  Copy = 'copy-folder',
  Delete = 'delete-folder',
}

export enum VectorFsItemAction {
  Move = 'move-item',
  Copy = 'copy-item',
  Edit = 'edit-item', // txt files
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
    case VectorFsGlobalAction.CreateTextFile:
      return <CreateTextFileAction />;
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

    // item actions
    case VectorFsItemAction.Move:
      return <VectorFsItemMoveAction />;
    case VectorFsItemAction.Copy:
      return <VectorFsItemCopyAction />;
    case VectorFsItemAction.Edit:
      return <VectorFsItemEditTextFileAction />;
    case VectorFsItemAction.Delete:
      return <VectorFsItemDeleteAction />;

    default:
      return null;
  }
};

export default VectorFSDrawer;
