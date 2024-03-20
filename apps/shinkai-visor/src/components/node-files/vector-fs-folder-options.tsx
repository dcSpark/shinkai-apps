import { useMoveVrFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/moveVRFolder/useUploadVRFiles';
import {
  Button,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@shinkai_network/shinkai-ui';
import { FolderInputIcon } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

import { useAuth } from '../../store/auth/auth';
import {
  FolderSelectionList,
  useVectorFolderSelectionStore,
} from './folder-selection-list';
import { useVectorFsStore } from './node-file-context';

export const VectorFsFolderMoveAction = ({
  path,
  name,
  closeDrawer,
}: {
  path: string;
  name: string;
  closeDrawer: () => void;
}) => {
  const auth = useAuth((state) => state.auth);
  const setCurrentGlobalPath = useVectorFsStore(
    (state) => state.setCurrentGlobalPath,
  );
  const destinationFolder = useVectorFolderSelectionStore(
    (state) => state.destinationFolder,
  );

  const { mutateAsync: moveVrFolder, isPending: isMovingVrFolder } =
    useMoveVrFolder({
      onSuccess: () => {
        setCurrentGlobalPath(destinationFolder?.path ?? '/');
        closeDrawer();
        toast.success('Folder moved successfully');
      },
      onError: () => {
        toast.error('Failed to move folder');
      },
    });

  return (
    <React.Fragment>
      <DrawerHeader>
        <DrawerTitle className="flex flex-col items-start gap-1">
          <FolderInputIcon className="h-10 w-10" />
          Move {name} to ...
        </DrawerTitle>
      </DrawerHeader>
      <FolderSelectionList />
      <DrawerFooter>
        <Button
          className="mt-4"
          disabled={destinationFolder?.path === path}
          isLoading={isMovingVrFolder}
          onClick={async () => {
            await moveVrFolder({
              nodeAddress: auth?.node_address ?? '',
              shinkaiIdentity: auth?.shinkai_identity ?? '',
              profile: auth?.profile ?? '',
              originPath: path,
              destinationPath: destinationFolder?.path ?? '/',
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
