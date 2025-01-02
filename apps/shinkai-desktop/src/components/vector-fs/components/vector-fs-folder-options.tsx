import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useCopyFolder } from '@shinkai_network/shinkai-node-state/v2/mutations/copyFolder/useCopyFolder';
import { useMoveFolder } from '@shinkai_network/shinkai-node-state/v2/mutations/moveFolder/useMoveFolder';
import { useRemoveFolder } from '@shinkai_network/shinkai-node-state/v2/mutations/removeFolder/useRemoveFolder';
import {
  Button,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@shinkai_network/shinkai-ui';
import React from 'react';
import { toast } from 'sonner';

import { useAuth } from '../../../store/auth';
import { useVectorFsStore } from '../context/vector-fs-context';
import {
  FolderSelectionList,
  useVectorFolderSelectionStore,
} from './folder-selection-list';

export const VectorFsFolderMoveAction = () => {
  const { t } = useTranslation();
  const selectedFolder = useVectorFsStore((state) => state.selectedFolder);
  const closeDrawerMenu = useVectorFsStore((state) => state.closeDrawerMenu);
  const auth = useAuth((state) => state.auth);
  const setCurrentGlobalPath = useVectorFsStore(
    (state) => state.setCurrentGlobalPath,
  );
  const destinationFolderPath = useVectorFolderSelectionStore(
    (state) => state.destinationFolderPath,
  );

  const { mutateAsync: moveVrFolder, isPending: isMovingVrFolder } =
    useMoveFolder({
      onSuccess: () => {
        setCurrentGlobalPath(destinationFolderPath ?? '/');
        closeDrawerMenu();
        toast.success(t('vectorFs.success.folderMoved'));
      },
      onError: () => {
        toast.error(t('vectorFs.errors.folderMoved'));
      },
    });

  return (
    <React.Fragment>
      <SheetHeader>
        <SheetTitle className="font-normal">
          {t('vectorFs.actions.move')}
          <span className="font-medium">
            {' '}
            &quot;{selectedFolder?.name}&quot;
          </span>{' '}
          to ...
        </SheetTitle>
      </SheetHeader>
      <FolderSelectionList />
      <SheetFooter>
        <Button
          className="mt-4"
          disabled={destinationFolderPath === selectedFolder?.path}
          isLoading={isMovingVrFolder}
          onClick={async () => {
            await moveVrFolder({
              nodeAddress: auth?.node_address ?? '',
              token: auth?.api_v2_key ?? '',
              originPath: selectedFolder?.path ?? '',
              destinationPath: destinationFolderPath ?? '/',
            });
          }}
        >
          {t('vectorFs.actions.move')}
        </Button>
      </SheetFooter>
    </React.Fragment>
  );
};
export const VectorFsFolderDeleteAction = () => {
  const { t } = useTranslation();
  const selectedFolder = useVectorFsStore((state) => state.selectedFolder);
  const auth = useAuth((state) => state.auth);
  const closeDrawerMenu = useVectorFsStore((state) => state.closeDrawerMenu);

  const { mutateAsync: deleteVrFolder, isPending } = useRemoveFolder({
    onSuccess: () => {
      closeDrawerMenu();
      toast.success(t('vectorFs.success.folderDeleted'));
    },
    onError: () => {
      toast.error(t('vectorFs.errors.folderDeleted'));
    },
  });

  return (
    <React.Fragment>
      <SheetHeader>
        <SheetTitle className="font-normal">
          {t('vectorFs.actions.delete')}
          <span className="font-medium">
            {' '}
            &quot;{selectedFolder?.name}&quot;
          </span>{' '}
        </SheetTitle>
      </SheetHeader>
      <p className="text-gray-80 my-3 text-base">
        {t('vectorFs.deleteFolderConfirmation')}
      </p>
      <SheetFooter>
        <Button
          className="mt-4"
          isLoading={isPending}
          onClick={async () => {
            await deleteVrFolder({
              nodeAddress: auth?.node_address ?? '',
              token: auth?.api_v2_key ?? '',
              folderPath: selectedFolder?.path ?? '',
            });
          }}
          variant="destructive"
        >
          {t('vectorFs.actions.delete')}
        </Button>
      </SheetFooter>
    </React.Fragment>
  );
};

export const VectorFsFolderCopyAction = () => {
  const { t } = useTranslation();

  const selectedFolder = useVectorFsStore((state) => state.selectedFolder);
  const closeDrawerMenu = useVectorFsStore((state) => state.closeDrawerMenu);
  const auth = useAuth((state) => state.auth);
  const setCurrentGlobalPath = useVectorFsStore(
    (state) => state.setCurrentGlobalPath,
  );
  const destinationFolderPath = useVectorFolderSelectionStore(
    (state) => state.destinationFolderPath,
  );

  const { mutateAsync: copyVrFolder, isPending } = useCopyFolder({
    onSuccess: () => {
      setCurrentGlobalPath(destinationFolderPath ?? '/');
      closeDrawerMenu();
      toast.success(t('vectorFs.success.folderCopied'));
    },
    onError: () => {
      toast.error(t('vectorFs.errors.folderCopied'));
    },
  });

  return (
    <React.Fragment>
      <SheetHeader>
        <SheetTitle className="font-normal">
          {t('vectorFs.actions.copy')}
          <span className="font-medium">
            {' '}
            &quot;{selectedFolder?.name}&quot;
          </span>{' '}
          to ...
        </SheetTitle>
      </SheetHeader>
      <FolderSelectionList />
      <SheetFooter>
        <Button
          className="mt-4"
          disabled={destinationFolderPath === selectedFolder?.path}
          isLoading={isPending}
          onClick={async () => {
            await copyVrFolder({
              nodeAddress: auth?.node_address ?? '',
              token: auth?.api_v2_key ?? '',
              originPath: selectedFolder?.path ?? '',
              destinationPath: destinationFolderPath ?? '/',
            });
          }}
        >
          {t('vectorFs.actions.copy')}
        </Button>
      </SheetFooter>
    </React.Fragment>
  );
};
