import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useCopyFsItem } from '@shinkai_network/shinkai-node-state/v2/mutations/copyFsItem/useCopyFsItem';
import { useMoveFsItem } from '@shinkai_network/shinkai-node-state/v2/mutations/moveFsItem/useMoveFsItem';
import { useRemoveFsItem } from '@shinkai_network/shinkai-node-state/v2/mutations/removeFsItem/useRemoveFsItem';
import {
  Button,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@shinkai_network/shinkai-ui';
import React from 'react';
import { toast } from 'sonner';

import { useAuth } from '../../store/auth/auth';
import {
  FolderSelectionList,
  useVectorFolderSelectionStore,
} from './folder-selection-list';
import { useVectorFsStore } from './node-file-context';

export const VectorFsItemMoveAction = () => {
  const { t } = useTranslation();
  const selectedFile = useVectorFsStore((state) => state.selectedFile);
  const closeDrawerMenu = useVectorFsStore((state) => state.closeDrawerMenu);
  const auth = useAuth((state) => state.auth);
  const setCurrentGlobalPath = useVectorFsStore(
    (state) => state.setCurrentGlobalPath,
  );
  const destinationFolderPath = useVectorFolderSelectionStore(
    (state) => state.destinationFolderPath,
  );

  const { mutateAsync: moveFsItem, isPending: isMovingVrFolder } =
    useMoveFsItem({
      onSuccess: () => {
        setCurrentGlobalPath(destinationFolderPath ?? '/');
        closeDrawerMenu();
        toast.success(t('vectorFs.success.fileMoved'));
      },
      onError: () => {
        toast.error(t('vectorFs.errors.fileMoved'));
      },
    });

  return (
    <React.Fragment>
      <DrawerHeader>
        <DrawerTitle className="font-normal">
          {t('vectorFs.actions.move')}
          <span className="font-medium">
            {' '}
            &quot;{selectedFile?.name}&quot;
          </span>{' '}
          to ...
        </DrawerTitle>
      </DrawerHeader>
      <FolderSelectionList />
      <DrawerFooter>
        <Button
          className="mt-4"
          disabled={destinationFolderPath === selectedFile?.path}
          isLoading={isMovingVrFolder}
          onClick={async () => {
            await moveFsItem({
              nodeAddress: auth?.node_address ?? '',
              token: auth?.api_v2_key ?? '',
              originPath: selectedFile?.path ?? '',
              destinationPath: destinationFolderPath ?? '/',
            });
          }}
        >
          {t('vectorFs.actions.move')}
        </Button>
      </DrawerFooter>
    </React.Fragment>
  );
};
export const VectorFsItemDeleteAction = () => {
  const { t } = useTranslation();
  const selectedFile = useVectorFsStore((state) => state.selectedFile);
  const auth = useAuth((state) => state.auth);
  const closeDrawerMenu = useVectorFsStore((state) => state.closeDrawerMenu);

  const { mutateAsync: deleteVrItem, isPending } = useRemoveFsItem({
    onSuccess: () => {
      closeDrawerMenu();
      toast.success(t('vectorFs.success.fileDeleted'));
    },
    onError: () => {
      toast.error(t('vectorFs.errors.fileDeleted'));
    },
  });

  return (
    <React.Fragment>
      <DrawerHeader>
        <DrawerTitle className="font-normal">
          {t('vectorFs.actions.delete')}
          <span className="font-medium">
            {' '}
            &quot;{selectedFile?.name}&quot;
          </span>{' '}
        </DrawerTitle>
      </DrawerHeader>

      <p className="text-gray-80 my-3 text-base">
        {t('vectorFs.deleteFileConfirmation')}
      </p>
      <DrawerFooter>
        <Button
          className="mt-4"
          isLoading={isPending}
          onClick={async () => {
            await deleteVrItem({
              nodeAddress: auth?.node_address ?? '',
              token: auth?.api_v2_key ?? '',
              itemPath: selectedFile?.path ?? '',
            });
          }}
          variant="destructive"
        >
          {t('vectorFs.actions.delete')}
        </Button>
      </DrawerFooter>
    </React.Fragment>
  );
};

export const VectorFsItemCopyAction = () => {
  const { t } = useTranslation();
  const selectedFile = useVectorFsStore((state) => state.selectedFile);
  const closeDrawerMenu = useVectorFsStore((state) => state.closeDrawerMenu);
  const auth = useAuth((state) => state.auth);
  const setCurrentGlobalPath = useVectorFsStore(
    (state) => state.setCurrentGlobalPath,
  );
  const destinationFolderPath = useVectorFolderSelectionStore(
    (state) => state.destinationFolderPath,
  );

  const { mutateAsync: copyVrFolder, isPending } = useCopyFsItem({
    onSuccess: () => {
      setCurrentGlobalPath(destinationFolderPath ?? '/');
      closeDrawerMenu();
      toast.success(t('vectorFs.success.fileCopied'));
    },
    onError: () => {
      toast.error(t('vectorFs.errors.fileCopied'));
    },
  });

  return (
    <React.Fragment>
      <DrawerHeader>
        <DrawerTitle className="font-normal">
          {t('vectorFs.actions.copy')}
          <span className="font-medium">
            {' '}
            &quot;{selectedFile?.name}&quot;
          </span>{' '}
          to ...
        </DrawerTitle>
      </DrawerHeader>
      <FolderSelectionList />
      <DrawerFooter>
        <Button
          className="mt-4"
          disabled={destinationFolderPath === selectedFile?.path}
          isLoading={isPending}
          onClick={async () => {
            await copyVrFolder({
              nodeAddress: auth?.node_address ?? '',
              token: auth?.api_v2_key ?? '',
              originPath: selectedFile?.path ?? '',
              destinationPath: destinationFolderPath ?? '/',
            });
          }}
        >
          {t('vectorFs.actions.copy')}
        </Button>
      </DrawerFooter>
    </React.Fragment>
  );
};
