import { zodResolver } from '@hookform/resolvers/zod';
import { isShinkaiIdentityLocalhost } from '@shinkai_network/shinkai-message-ts/utils';
import {
  ShareFolderFormSchema,
  shareFolderFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/vector-fs/folder';
import { useCopyVrFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/copyVRFolder/useCopyVrFolder';
import { useCreateShareableFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/createShareableFolder/useCreateShareableFolder';
import { useDeleteVrFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/deleteVRFolder/useDeleteVRFolder';
import { useMoveVrFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/moveVRFolder/useMoveVRFolder';
import { useUnshareFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/unshareFolder/useUnshareFolder';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Form,
  FormField,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { AlertCircle } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useAuth } from '../../store/auth/auth';
import {
  FolderSelectionList,
  useVectorFolderSelectionStore,
} from './folder-selection-list';
import { useVectorFsStore } from './node-file-context';

export const VectorFsFolderMoveAction = () => {
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
    useMoveVrFolder({
      onSuccess: () => {
        setCurrentGlobalPath(destinationFolderPath ?? '/');
        closeDrawerMenu();
        toast.success('Folder moved successfully');
      },
      onError: () => {
        toast.error('Failed to move folder');
      },
    });

  return (
    <React.Fragment>
      <DrawerHeader>
        <DrawerTitle className="font-normal">
          Move
          <span className="font-medium">
            {' '}
            &quot;{selectedFolder?.name}&quot;
          </span>{' '}
          to ...
        </DrawerTitle>
      </DrawerHeader>
      <FolderSelectionList />
      <DrawerFooter>
        <Button
          className="mt-4"
          disabled={destinationFolderPath === selectedFolder?.path}
          isLoading={isMovingVrFolder}
          onClick={async () => {
            await moveVrFolder({
              nodeAddress: auth?.node_address ?? '',
              shinkaiIdentity: auth?.shinkai_identity ?? '',
              profile: auth?.profile ?? '',
              originPath: selectedFolder?.path ?? '',
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
export const VectorFsFolderDeleteAction = () => {
  const selectedFolder = useVectorFsStore((state) => state.selectedFolder);
  const auth = useAuth((state) => state.auth);
  const closeDrawerMenu = useVectorFsStore((state) => state.closeDrawerMenu);

  const { mutateAsync: deleteVrFolder, isPending } = useDeleteVrFolder({
    onSuccess: () => {
      closeDrawerMenu();
      toast.success('Folder has been deleted');
    },
    onError: () => {
      toast.error('Failed to delete folder');
    },
  });

  return (
    <React.Fragment>
      <DrawerHeader>
        <DrawerTitle className="font-normal">
          Delete
          <span className="font-medium">
            {' '}
            &quot;{selectedFolder?.name}&quot;
          </span>{' '}
        </DrawerTitle>
      </DrawerHeader>
      <p className="text-gray-80 my-3 text-base">
        Are you sure you want to delete this folder? This action cannot be
        undone.
      </p>
      <DrawerFooter>
        <Button
          className="mt-4"
          isLoading={isPending}
          onClick={async () => {
            await deleteVrFolder({
              nodeAddress: auth?.node_address ?? '',
              shinkaiIdentity: auth?.shinkai_identity ?? '',
              profile: auth?.profile ?? '',
              folderPath: selectedFolder?.path ?? '',
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

export const VectorFsFolderCopyAction = () => {
  const selectedFolder = useVectorFsStore((state) => state.selectedFolder);
  const closeDrawerMenu = useVectorFsStore((state) => state.closeDrawerMenu);
  const auth = useAuth((state) => state.auth);
  const setCurrentGlobalPath = useVectorFsStore(
    (state) => state.setCurrentGlobalPath,
  );
  const destinationFolderPath = useVectorFolderSelectionStore(
    (state) => state.destinationFolderPath,
  );

  const { mutateAsync: copyVrFolder, isPending } = useCopyVrFolder({
    onSuccess: () => {
      setCurrentGlobalPath(destinationFolderPath ?? '/');
      closeDrawerMenu();
      toast.success('Folder copied successfully');
    },
    onError: () => {
      toast.error('Failed to copy folder');
    },
  });

  return (
    <React.Fragment>
      <DrawerHeader>
        <DrawerTitle className="font-normal">
          Copy
          <span className="font-medium">
            {' '}
            &quot;{selectedFolder?.name}&quot;
          </span>{' '}
          to ...
        </DrawerTitle>
      </DrawerHeader>
      <FolderSelectionList />
      <DrawerFooter>
        <Button
          className="mt-4"
          disabled={destinationFolderPath === selectedFolder?.path}
          isLoading={isPending}
          onClick={async () => {
            await copyVrFolder({
              nodeAddress: auth?.node_address ?? '',
              shinkaiIdentity: auth?.shinkai_identity ?? '',
              profile: auth?.profile ?? '',
              originPath: selectedFolder?.path ?? '',
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

export const VectorFsFolderCreateShareableAction = () => {
  const selectedFolder = useVectorFsStore((state) => state.selectedFolder);
  const closeDrawerMenu = useVectorFsStore((state) => state.closeDrawerMenu);
  const auth = useAuth((state) => state.auth);
  const shareFolderForm = useForm<ShareFolderFormSchema>({
    resolver: zodResolver(shareFolderFormSchema),
  });
  const destinationFolderPath = useVectorFolderSelectionStore(
    (state) => state.destinationFolderPath,
  );
  const setSelectedVectorFsTab = useVectorFsStore(
    (state) => state.setSelectedVectorFsTab,
  );

  const { mutateAsync: createShareableFolder, isPending } =
    useCreateShareableFolder({
      onSuccess: () => {
        closeDrawerMenu();
        toast.success('Folder shared successfully');
        setSelectedVectorFsTab('shared-folders');
      },
      onError: () => {
        toast.error('Failed to shared folder');
      },
    });

  const onSubmit = async (data: ShareFolderFormSchema) => {
    await createShareableFolder({
      nodeAddress: auth?.node_address ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      profile: auth?.profile ?? '',
      folderPath: selectedFolder?.path ?? '',
      folderDescription: data.folderDescription ?? '',
      my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
      my_device_identity_sk: auth?.profile_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    });
  };
  const isIdentityLocalhost = isShinkaiIdentityLocalhost(
    auth?.shinkai_identity ?? '',
  );

  return (
    <React.Fragment>
      <DrawerHeader>
        <DrawerTitle className="line-clamp-1 font-normal">
          Share
          <span className="font-medium">
            {' '}
            &quot;{selectedFolder?.name}&quot;
          </span>{' '}
        </DrawerTitle>
        <DrawerDescription>
          You can share folders that you store in AI Files with anyone.
        </DrawerDescription>
      </DrawerHeader>
      <Form {...shareFolderForm}>
        <form
          className="mt-5 flex flex-col gap-3"
          onSubmit={shareFolderForm.handleSubmit(onSubmit)}
        >
          <FormField
            control={shareFolderForm.control}
            name="folderDescription"
            render={({ field }) => (
              <TextField autoFocus field={field} label="Folder Description" />
            )}
          />
          <Button
            className="mt-4"
            disabled={
              destinationFolderPath === selectedFolder?.path ||
              isIdentityLocalhost
            }
            isLoading={isPending}
            type="submit"
          >
            Share Folder
          </Button>

          {isIdentityLocalhost && (
            <Alert className="mx-auto w-[98%] shadow-lg" variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm">Enable Folder Sharing</AlertTitle>
              <AlertDescription className="text-xs">
                <div className="">
                  You must register a Shinkai identity before you can share
                  folders over the Shinkai Network.{' '}
                  <a
                    className="underline"
                    href="https://docs.shinkai.com/for-end-users/register-identity-onchain/"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Click Here To Learn How
                  </a>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </form>
      </Form>
    </React.Fragment>
  );
};
export const VectorFsFolderUnshareAction = () => {
  const selectedFolder = useVectorFsStore((state) => state.selectedFolder);
  const closeDrawerMenu = useVectorFsStore((state) => state.closeDrawerMenu);
  const auth = useAuth((state) => state.auth);
  const destinationFolderPath = useVectorFolderSelectionStore(
    (state) => state.destinationFolderPath,
  );

  const { mutateAsync: unshareFolder, isPending } = useUnshareFolder({
    onSuccess: () => {
      closeDrawerMenu();
      toast.success('Unshared folder successfully');
    },
    onError: () => {
      toast.error('Failed to unshared folder');
    },
  });

  return (
    <React.Fragment>
      <DrawerHeader>
        <DrawerTitle className="line-clamp-1 font-normal">
          Unshare
          <span className="font-medium">
            {' '}
            &quot;{selectedFolder?.name}&quot;
          </span>{' '}
          ?
        </DrawerTitle>
        <DrawerDescription className="py-3">
          Everyone will be removed from this folder. You’ll still keep a copy of
          this folder in your AI Files. <br />
          Note: Removed members will keep a copy of this shared folder.
        </DrawerDescription>
      </DrawerHeader>

      <DrawerFooter>
        <Button
          className="mt-4"
          disabled={destinationFolderPath === selectedFolder?.path}
          isLoading={isPending}
          onClick={async () => {
            await unshareFolder({
              nodeAddress: auth?.node_address ?? '',
              shinkaiIdentity: auth?.shinkai_identity ?? '',
              profile: auth?.profile ?? '',
              folderPath: selectedFolder?.path ?? '',
              my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
              my_device_identity_sk: auth?.profile_identity_sk ?? '',
              node_encryption_pk: auth?.node_encryption_pk ?? '',
              profile_encryption_sk: auth?.profile_encryption_sk ?? '',
              profile_identity_sk: auth?.profile_identity_sk ?? '',
            });
          }}
        >
          Unshare Folder
        </Button>
      </DrawerFooter>
    </React.Fragment>
  );
};
