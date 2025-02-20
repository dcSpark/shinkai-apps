import { DialogClose } from '@shinkai_network/shinkai-artifacts';
import {
  buttonVariants,
  Dialog,
  DialogContent,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { XIcon } from 'lucide-react';

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

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          setActiveDrawerMenuOption(null);
          setSelectedFolder(null);
          setSelectedFile(null);
        }
      }}
      open={!!activeDrawerMenuOption}
    >
      <DialogContent
        className={cn(
          'flex max-w-lg flex-col',
          activeDrawerMenuOption === VectorFsGlobalAction.NewFolder &&
            'max-w-md',
          (activeDrawerMenuOption === VectorFsGlobalAction.CreateTextFile ||
            activeDrawerMenuOption === VectorFsItemAction.Edit) &&
            'h-full max-h-[90vh] max-w-[85%]',
          activeDrawerMenuOption === VectorFsGlobalAction.VectorFileDetails &&
            'size-full max-h-[99vh] max-w-[99vw] bg-transparent p-1',
          (activeDrawerMenuOption === VectorFsItemAction.Move ||
            activeDrawerMenuOption === VectorFsItemAction.Copy ||
            activeDrawerMenuOption === VectorFsFolderAction.Move ||
            activeDrawerMenuOption === VectorFsFolderAction.Copy) &&
            'max-w-xl',
        )}
      >
        <DialogClose
          className={cn(
            buttonVariants({ variant: 'tertiary', size: 'icon' }),
            'absolute right-3 top-3 p-1',
            activeDrawerMenuOption === VectorFsGlobalAction.VectorFileDetails &&
              'right-5 top-5',
          )}
        >
          <XIcon className="size-4" />
        </DialogClose>
        <VectorFolderSelectionProvider>
          <VectorFSDrawerContent selectedOption={activeDrawerMenuOption} />
        </VectorFolderSelectionProvider>
      </DialogContent>
    </Dialog>
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
