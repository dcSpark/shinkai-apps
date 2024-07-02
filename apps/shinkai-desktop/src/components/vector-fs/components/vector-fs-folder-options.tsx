import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
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
  Form,
  FormField,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { AlertCircle } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
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
    useMoveVrFolder({
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

  const { mutateAsync: deleteVrFolder, isPending } = useDeleteVrFolder({
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

  const { mutateAsync: copyVrFolder, isPending } = useCopyVrFolder({
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
          {t('vectorFs.actions.copy')}
        </Button>
      </SheetFooter>
    </React.Fragment>
  );
};

export const VectorFsFolderCreateShareableAction = () => {
  const { t } = useTranslation();
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
        toast.success(t('vectorFs.success.folderShared'));
        setSelectedVectorFsTab('shared-folders');
      },
      onError: () => {
        toast.error(t('vectorFs.errors.folderShared'));
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
      <SheetHeader>
        <SheetTitle className="line-clamp-1 font-normal">
          {t('vectorFs.actions.share')}
          <span className="font-medium">
            {' '}
            &quot;{selectedFolder?.name}&quot;
          </span>{' '}
        </SheetTitle>
        <SheetDescription>
          {t('vectorFs.actions.shareFolderText')}
        </SheetDescription>
      </SheetHeader>
      <Form {...shareFolderForm}>
        <form
          className="mt-5 flex flex-col gap-3"
          onSubmit={shareFolderForm.handleSubmit(onSubmit)}
        >
          <FormField
            control={shareFolderForm.control}
            name="folderDescription"
            render={({ field }) => (
              <TextField
                autoFocus
                field={field}
                label={t('vectorFs.forms.folderDescription')}
              />
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
            {t('vectorFs.actions.share')}
          </Button>

          {isIdentityLocalhost && (
            <Alert className="mx-auto w-[98%] shadow-lg" variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm">
                {t('vectorFs.shareFolderWarning.title')}
              </AlertTitle>
              <AlertDescription className="text-xs">
                <div className="">
                  {t('vectorFs.shareFolderWarning.text')}

                  <a
                    className="underline"
                    href="https://docs.shinkai.com/for-end-users/register-identity-onchain/"
                    rel="noreferrer"
                    target="_blank"
                  >
                    {t('vectorFs.shareFolderWarning.action')}{' '}
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
  const { t, Trans } = useTranslation();
  const selectedFolder = useVectorFsStore((state) => state.selectedFolder);
  const closeDrawerMenu = useVectorFsStore((state) => state.closeDrawerMenu);
  const auth = useAuth((state) => state.auth);
  const destinationFolderPath = useVectorFolderSelectionStore(
    (state) => state.destinationFolderPath,
  );

  const { mutateAsync: unshareFolder, isPending } = useUnshareFolder({
    onSuccess: () => {
      closeDrawerMenu();
      toast.success(t('vectorFs.success.folderUnshared'));
    },
    onError: () => {
      toast.error(t('vectorFs.errors.folderUnshared'));
    },
  });

  return (
    <React.Fragment>
      <SheetHeader>
        <SheetTitle className="line-clamp-1 font-normal">
          {t('vectorFs.actions.unshare')}
          <span className="font-medium">
            {' '}
            &quot;{selectedFolder?.name}&quot;
          </span>{' '}
          ?
        </SheetTitle>
        <SheetDescription className="py-3">
          <Trans
            components={{ br: <br /> }}
            i18nKey="vectorFs.actions.unshareFolderText"
          />
        </SheetDescription>
      </SheetHeader>

      <SheetFooter>
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
          {t('vectorFs.actions.unshare')}
        </Button>
      </SheetFooter>
    </React.Fragment>
  );
};
