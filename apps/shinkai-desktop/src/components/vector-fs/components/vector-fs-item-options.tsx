import { useCopyVrItem } from '@shinkai_network/shinkai-node-state/lib/mutations/copyVRItem/useCopyVrItem';
import { useDeleteVRItem } from '@shinkai_network/shinkai-node-state/lib/mutations/deleteVRItem/useDeleteVRItem';
import { useMoveVRItem } from '@shinkai_network/shinkai-node-state/lib/mutations/moveVRItem/useMoveVRItem';
import {
  Button,
  DrawerFooter,
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

export const VectorFsItemMoveAction = () => {
  const selectedFile = useVectorFsStore((state) => state.selectedFile);
  const closeDrawerMenu = useVectorFsStore((state) => state.closeDrawerMenu);
  const auth = useAuth((state) => state.auth);
  const setCurrentGlobalPath = useVectorFsStore(
    (state) => state.setCurrentGlobalPath,
  );
  const destinationFolderPath = useVectorFolderSelectionStore(
    (state) => state.destinationFolderPath,
  );

  const { mutateAsync: moveVrFolder, isPending: isMovingVrFolder } =
    useMoveVRItem({
      onSuccess: () => {
        setCurrentGlobalPath(destinationFolderPath ?? '/');
        closeDrawerMenu();
        toast.success('Item moved successfully');
      },
      onError: () => {
        toast.error('Failed to move item');
      },
    });

  return (
    <React.Fragment>
      <SheetHeader>
        <SheetTitle className="font-normal">
          Move
          <span className="font-medium">
            {' '}
            &quot;{selectedFile?.name}&quot;
          </span>{' '}
          to ...
        </SheetTitle>
      </SheetHeader>
      <FolderSelectionList />
      <DrawerFooter>
        <Button
          className="mt-4"
          disabled={destinationFolderPath === selectedFile?.path}
          isLoading={isMovingVrFolder}
          onClick={async () => {
            await moveVrFolder({
              nodeAddress: auth?.node_address ?? '',
              shinkaiIdentity: auth?.shinkai_identity ?? '',
              profile: auth?.profile ?? '',
              originPath: selectedFile?.path ?? '',
              destinationPath: destinationFolderPath ?? '/',
              my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
              my_device_identity_sk: auth?.profile_identity_sk ?? '',
              node_encryption_pk: auth?.node_encryption_pk ?? '',
              profile_encryption_sk: auth?.profile_encryption_sk ?? '',
              profile_identity_sk: auth?.profile_identity_sk ?? '',
            });
          }}
        >
          Move
        </Button>
      </DrawerFooter>
    </React.Fragment>
  );
};
export const VectorFsItemDeleteAction = () => {
  const selectedFile = useVectorFsStore((state) => state.selectedFile);
  const auth = useAuth((state) => state.auth);
  const closeDrawerMenu = useVectorFsStore((state) => state.closeDrawerMenu);

  const { mutateAsync: deleteVrItem, isPending } = useDeleteVRItem({
    onSuccess: () => {
      closeDrawerMenu();
      toast.success('Item has been deleted');
    },
    onError: () => {
      toast.error('Failed to delete item');
    },
  });

  return (
    <React.Fragment>
      <SheetHeader>
        <SheetTitle className="font-normal">
          Delete
          <span className="font-medium">
            {' '}
            &quot;{selectedFile?.name}&quot;
          </span>{' '}
        </SheetTitle>
      </SheetHeader>

      <p className="text-gray-80 my-3 text-base">
        Are you sure you want to delete this item? This action cannot be undone.
      </p>
      <DrawerFooter>
        <Button
          className="mt-4"
          isLoading={isPending}
          onClick={async () => {
            await deleteVrItem({
              nodeAddress: auth?.node_address ?? '',
              shinkaiIdentity: auth?.shinkai_identity ?? '',
              profile: auth?.profile ?? '',
              itemPath: selectedFile?.path ?? '',
              my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
              my_device_identity_sk: auth?.profile_identity_sk ?? '',
              node_encryption_pk: auth?.node_encryption_pk ?? '',
              profile_encryption_sk: auth?.profile_encryption_sk ?? '',
              profile_identity_sk: auth?.profile_identity_sk ?? '',
            });
          }}
          variant="destructive"
        >
          Delete
        </Button>
      </DrawerFooter>
    </React.Fragment>
  );
};

export const VectorFsItemCopyAction = () => {
  const selectedFile = useVectorFsStore((state) => state.selectedFile);
  const closeDrawerMenu = useVectorFsStore((state) => state.closeDrawerMenu);
  const auth = useAuth((state) => state.auth);
  const setCurrentGlobalPath = useVectorFsStore(
    (state) => state.setCurrentGlobalPath,
  );
  const destinationFolderPath = useVectorFolderSelectionStore(
    (state) => state.destinationFolderPath,
  );

  const { mutateAsync: copyVrFolder, isPending } = useCopyVrItem({
    onSuccess: () => {
      setCurrentGlobalPath(destinationFolderPath ?? '/');
      closeDrawerMenu();
      toast.success('Item copied successfully');
    },
    onError: () => {
      toast.error('Failed to copy item');
    },
  });

  return (
    <React.Fragment>
      <SheetHeader>
        <SheetTitle className="font-normal">
          Copy
          <span className="font-medium">
            {' '}
            &quot;{selectedFile?.name}&quot;
          </span>{' '}
          to ...
        </SheetTitle>
      </SheetHeader>
      <FolderSelectionList />
      <DrawerFooter>
        <Button
          className="mt-4"
          disabled={destinationFolderPath === selectedFile?.path}
          isLoading={isPending}
          onClick={async () => {
            await copyVrFolder({
              nodeAddress: auth?.node_address ?? '',
              shinkaiIdentity: auth?.shinkai_identity ?? '',
              profile: auth?.profile ?? '',
              originPath: selectedFile?.path ?? '',
              destinationPath: destinationFolderPath ?? '/',
              my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
              my_device_identity_sk: auth?.profile_identity_sk ?? '',
              node_encryption_pk: auth?.node_encryption_pk ?? '',
              profile_encryption_sk: auth?.profile_encryption_sk ?? '',
              profile_identity_sk: auth?.profile_identity_sk ?? '',
            });
          }}
        >
          Copy
        </Button>
      </DrawerFooter>
    </React.Fragment>
  );
};
