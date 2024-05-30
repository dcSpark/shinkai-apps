import { zodResolver } from '@hookform/resolvers/zod';
import {
  ShareFolderFormSchema,
  shareFolderFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/vector-fs/folder';
import {
  SearchVectorFormSchema,
  searchVectorFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/vector-fs/vector-search';
import { useCopyVrFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/copyVRFolder/useCopyVrFolder';
import { useCreateShareableFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/createShareableFolder/useCreateShareableFolder';
import { useDeleteVrFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/deleteVRFolder/useDeleteVRFolder';
import { useMoveVrFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/moveVRFolder/useMoveVRFolder';
import { useUnshareFolder } from '@shinkai_network/shinkai-node-state/lib/mutations/unshareFolder/useUnshareFolder';
import { useGetVRSeachSimplified } from '@shinkai_network/shinkai-node-state/lib/queries/getVRSearchSimplified/useGetSearchVRItems';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Form,
  FormField,
  Input,
  ScrollArea,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { AlertCircle, SearchIcon, XIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '../../../store/auth';
import { useVectorFsStore } from '../context/vector-fs-context';
import {
  FolderSelectionList,
  useVectorFolderSelectionStore,
} from './folder-selection-list';

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
      <SheetHeader>
        <SheetTitle className="font-normal">
          Move
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
          Move
        </Button>
      </SheetFooter>
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
      <SheetHeader>
        <SheetTitle className="font-normal">
          Delete
          <span className="font-medium">
            {' '}
            &quot;{selectedFolder?.name}&quot;
          </span>{' '}
        </SheetTitle>
      </SheetHeader>
      <p className="text-gray-80 my-3 text-base">
        Are you sure you want to delete this folder? This action cannot be
        undone.
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
          Delete
        </Button>
      </SheetFooter>
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
      <SheetHeader>
        <SheetTitle className="font-normal">
          Copy
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
          Copy
        </Button>
      </SheetFooter>
    </React.Fragment>
  );
};

export const VectorFsFolderSearchKnowledgeAction = () => {
  const selectedFolder = useVectorFsStore((state) => state.selectedFolder);
  const auth = useAuth((state) => state.auth);
  const [isSearchEntered, setIsSearchEntered] = useState(false);
  const [search, setSearch] = useState('');
  const closeDrawerMenu = useVectorFsStore((state) => state.closeDrawerMenu);
  const searchVectorFSForm = useForm<SearchVectorFormSchema>({
    resolver: zodResolver(searchVectorFormSchema),
    defaultValues: {
      searchQuery: '',
    },
  });
  const currentSearchQuery = useWatch({
    control: searchVectorFSForm.control,
    name: 'searchQuery',
  });

  const { isPending, isLoading, isSuccess, data } = useGetVRSeachSimplified(
    {
      nodeAddress: auth?.node_address ?? '',
      search: search,
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      profile: auth?.profile ?? '',
      my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
      my_device_identity_sk: auth?.my_device_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
      path: selectedFolder?.path,
    },
    {
      enabled: isSearchEntered || !!search,
      refetchOnWindowFocus: false,
    },
  );

  const onSubmit = async (data: SearchVectorFormSchema) => {
    if (!data.searchQuery) return;
    setIsSearchEntered(true);
    setSearch(data.searchQuery);
  };

  return (
    <React.Fragment>
      <SheetHeader>
        <SheetTitle className="font-normal">
          AI Files Content Search within
          <span className="font-medium">
            {' '}
            &quot;{selectedFolder?.name}&quot;
          </span>{' '}
        </SheetTitle>
      </SheetHeader>
      <p className="text-gray-80 my-3 text-sm">
        Search to find content across all files in your AI Files easily
      </p>
      <Form {...searchVectorFSForm}>
        <form
          className="mb-4 flex shrink-0 flex-col items-center gap-2 pt-4"
          onSubmit={searchVectorFSForm.handleSubmit(onSubmit)}
        >
          <FormField
            control={searchVectorFSForm.control}
            name="searchQuery"
            render={({ field }) => (
              <div className="relative flex h-10 w-full flex-1 items-center">
                <Input
                  autoFocus
                  className="placeholder-gray-80 !h-[50px] bg-gray-200 py-2 pl-10"
                  onChange={field.onChange}
                  placeholder="Search anything..."
                  value={field.value}
                />
                <SearchIcon className="absolute left-4 top-1/2 -z-[1px] h-4 w-4 -translate-y-1/2 bg-gray-300" />
                {currentSearchQuery && (
                  <Button
                    className="absolute right-1 h-8 w-8 bg-gray-200 p-2"
                    onClick={() => {
                      searchVectorFSForm.reset({ searchQuery: '' });
                    }}
                    size="auto"
                    type="button"
                    variant="ghost"
                  >
                    <XIcon />
                    <span className="sr-only">Clear Search</span>
                  </Button>
                )}
              </div>
            )}
          />
          <Button
            className="w-full"
            disabled={isPending && isLoading}
            isLoading={isPending && isLoading}
            size="default"
            type="submit"
          >
            <span className="">Search</span>
          </Button>
        </form>
      </Form>
      <ScrollArea className="h-[60vh] pr-4  [&>div>div]:!block">
        {isSearchEntered &&
          isPending &&
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              className="mb-1 flex h-[69px] items-center justify-between gap-2 rounded-lg bg-gray-400 py-3"
              key={idx}
            />
          ))}
        {isSearchEntered && isSuccess && (
          <div>
            <h2 className="text-gray-80 p-2 font-medium">
              Found {data?.length} results
            </h2>
            <div className="flex flex-col gap-2 divide-y divide-slate-600">
              {data?.map(([content, pathList, score], idx) => (
                <div className="flex flex-col gap-1 px-2 py-3" key={idx}>
                  <p className="text-sm text-white">{content}</p>
                  <div className="text-gray-80 flex justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <span>Source:</span>
                      <Link
                        className={'underline'}
                        onClick={() => {
                          closeDrawerMenu();
                        }}
                        to={{
                          pathname: '/node-files',
                          search: `?path=${encodeURIComponent(
                            pathList.join('/'),
                          )}`,
                        }}
                      >
                        {pathList.join('/')}
                      </Link>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Accuracy:</span>
                      <span>{parseFloat(score.toFixed(2)) * 100 + '%'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
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
  const isShinkaiIdentityLocalhost =
    auth?.shinkai_identity.includes('localhost.shinkai');

  return (
    <React.Fragment>
      <SheetHeader>
        <SheetTitle className="line-clamp-1 font-normal">
          Share
          <span className="font-medium">
            {' '}
            &quot;{selectedFolder?.name}&quot;
          </span>{' '}
        </SheetTitle>
        <SheetDescription>
          You can share folders that you store in AI Files with anyone.
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
              <TextField autoFocus field={field} label="Folder Description" />
            )}
          />
          <Button
            className="mt-4"
            disabled={
              destinationFolderPath === selectedFolder?.path ||
              isShinkaiIdentityLocalhost
            }
            isLoading={isPending}
            type="submit"
          >
            Share Folder
          </Button>

          {isShinkaiIdentityLocalhost && (
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
      <SheetHeader>
        <SheetTitle className="line-clamp-1 font-normal">
          Unshare
          <span className="font-medium">
            {' '}
            &quot;{selectedFolder?.name}&quot;
          </span>{' '}
          ?
        </SheetTitle>
        <SheetDescription className="py-3">
          Everyone will be removed from this folder. You’ll still keep a copy of
          this folder in your AI Files. <br />
          Note: Removed members will keep a copy of this shared folder.
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
          Unshare Folder
        </Button>
      </SheetFooter>
    </React.Fragment>
  );
};
