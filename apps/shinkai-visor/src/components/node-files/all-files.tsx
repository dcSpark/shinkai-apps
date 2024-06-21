import { HomeIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useGetMySharedFolders } from '@shinkai_network/shinkai-node-state/lib/queries/getMySharedFolders/useGetMySharedFolders';
import { useGetSearchVRItems } from '@shinkai_network/shinkai-node-state/lib/queries/getSearchVRItems/useGetSearchVRItems';
import {
  VRFolder,
  VRItem,
} from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/types';
import { useGetVRPathSimplified } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/useGetVRPathSimplified';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  ScrollArea,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  AddNewFolderIcon,
  CreateAIIcon,
  FileEmptyStateIcon,
  FileTypeIcon,
  GenerateDocIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { useDebounce } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { motion } from 'framer-motion';
import { ChevronRight, PlusIcon, SearchIcon, X, XIcon } from 'lucide-react';
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useQuery } from '../../hooks/use-query';
import { useAuth } from '../../store/auth/auth';
import { useVectorFsStore, VectorFSLayout } from './node-file-context';
import { VectorFsGlobalAction } from './vector-fs-drawer';
import VectorFsFolder from './vector-fs-folder';
import VectorFsItem from './vector-fs-item';
import VectorFsToggleLayout from './vector-fs-toggle-layout';
import VectorFsToggleSortName from './vector-fs-toggle-sort-name';

const MotionButton = motion(Button);

const AllFiles = () => {
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation() as { state: { files: File[] } };
  const query = useQuery();
  const { t } = useTranslation();
  const currentGlobalPath = useVectorFsStore(
    (state) => state.currentGlobalPath,
  );
  const setCurrentGlobalPath = useVectorFsStore(
    (state) => state.setCurrentGlobalPath,
  );

  const setActiveDrawerMenuOption = useVectorFsStore(
    (state) => state.setActiveDrawerMenuOption,
  );
  const layout = useVectorFsStore((state) => state.layout);
  const isSortByName = useVectorFsStore((state) => state.isSortByName);

  const isVRSelectionActive = useVectorFsStore(
    (state) => state.isVRSelectionActive,
  );
  const setVRSelectionActive = useVectorFsStore(
    (state) => state.setVRSelectionActive,
  );
  const [searchQuery, setSearchQuery] = React.useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 600);
  const {
    isPending: isVRFilesPending,
    data: VRFiles,
    isSuccess: isVRFilesSuccess,
  } = useGetVRPathSimplified(
    {
      nodeAddress: auth?.node_address ?? '',
      profile: auth?.profile ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      path: currentGlobalPath,
      my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
      my_device_identity_sk: auth?.profile_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    },
    {
      refetchInterval: 6000,
    },
  );

  const {
    data: searchVRItems,
    isSuccess: isSearchVRItemsSuccess,
    isLoading: isSearchVRItemsLoading,
  } = useGetSearchVRItems(
    {
      nodeAddress: auth?.node_address ?? '',
      profile: auth?.profile ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      path: currentGlobalPath,
      search: debouncedSearchQuery,
      my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
      my_device_identity_sk: auth?.profile_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    },
    {
      enabled: !!debouncedSearchQuery,
    },
  );

  const { data: sharedFolders } = useGetMySharedFolders({
    nodeAddress: auth?.node_address ?? '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const setSelectedFile = useVectorFsStore((state) => state.setSelectedFile);
  const [selectedFiles, setSelectedFiles] = React.useState<VRItem[]>([]);
  const [selectedFolders, setSelectedFolders] = React.useState<VRFolder[]>([]);
  const [isMenuOpened, setMenuOpened] = React.useState(false);

  useEffect(() => {
    const isFileDetailsActive = query.has('path');
    if (isFileDetailsActive) {
      const path = decodeURIComponent(query.get('path') ?? '');
      const directoryMainPath = path.split('/').slice(0, -1);
      setCurrentGlobalPath(
        directoryMainPath.length > 1
          ? '/' + directoryMainPath.join('/')
          : '/' + directoryMainPath,
      );
    }
  }, [query]);
  const handleSelectFiles = (file: VRItem) => {
    if (selectedFiles.some((selectedFile) => selectedFile.path === file.path)) {
      setSelectedFiles(selectedFiles.filter((item) => item !== file));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  const handleSelectFolders = (folder: VRFolder) => {
    if (
      selectedFolders.some(
        (selectedFolder) => selectedFolder.path === folder.path,
      )
    ) {
      setSelectedFolders(selectedFolders.filter((item) => item !== folder));
    } else {
      setSelectedFolders([...selectedFolders, folder]);
    }
  };

  useEffect(() => {
    if (location.state?.files) {
      setActiveDrawerMenuOption(
        VectorFsGlobalAction.GenerateFromDocumentIncludeFolder,
      );
    }
  }, [location.state?.files, setActiveDrawerMenuOption]);

  const actionList = [
    {
      name: t('vectorFs.actions.createFolder'),
      icon: <AddNewFolderIcon className="mr-2 h-4 w-4" />,
      onClick: () => {
        setActiveDrawerMenuOption(VectorFsGlobalAction.NewFolder);
      },
    },
    {
      name: t('vectorFs.actions.uploadFile'),
      icon: <GenerateDocIcon className="mr-2 h-4 w-4" />,
      disabled: currentGlobalPath === '/',
      onClick: () => {
        setActiveDrawerMenuOption(VectorFsGlobalAction.GenerateFromDocument);
      },
    },
  ];

  const splitCurrentPath = VRFiles?.path?.split('/').filter(Boolean) ?? [];

  const folderList = React.useMemo(() => {
    return isSortByName
      ? [...(VRFiles?.child_folders ?? [])].sort((a, b) =>
          a.name.localeCompare(b.name),
        )
      : VRFiles?.child_folders;
  }, [VRFiles?.child_folders, isSortByName]);

  const itemList = React.useMemo(() => {
    return isSortByName
      ? [...(VRFiles?.child_items ?? [])].sort((a, b) =>
          a.name.localeCompare(b.name),
        )
      : VRFiles?.child_items;
  }, [VRFiles?.child_items, isSortByName]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-3">
        <div className="relative flex h-10 w-full flex-1 items-center">
          <Input
            className="placeholder-gray-80 !h-full bg-transparent py-2 pl-10"
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            placeholder={t('common.searchPlaceholder')}
            value={searchQuery}
          />
          <SearchIcon className="absolute left-4 top-1/2 -z-[1px] h-4 w-4 -translate-y-1/2" />
          {searchQuery && (
            <Button
              className="absolute right-1 h-8 w-8 bg-gray-200 p-2"
              onClick={() => {
                setSearchQuery('');
              }}
              size="auto"
              type="button"
              variant="ghost"
            >
              <XIcon />
              <span className="sr-only">{t('common.clearSearch')}</span>
            </Button>
          )}
        </div>
        <DropdownMenu
          modal={false}
          onOpenChange={(value) => setMenuOpened(value)}
          open={isMenuOpened}
        >
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              {!isMenuOpened ? (
                <PlusIcon className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            alignOffset={-10}
            className="w-[200px] px-2 py-2"
            sideOffset={10}
          >
            {actionList.map((item, index) => (
              <DropdownMenuItem
                disabled={item.disabled}
                key={index}
                onClick={item.onClick}
              >
                {item.icon}
                <span>{item.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex gap-1">
          <VectorFsToggleSortName />
          <Separator
            className="bg-gray-300"
            decorative
            orientation="vertical"
          />
          <VectorFsToggleLayout />
        </div>
      </div>
      {!searchQuery && (
        <div className="mt-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <button
                    className={cn(
                      'flex items-center gap-2 rounded-full p-2 hover:bg-gray-400',
                      currentGlobalPath === '/' && 'text-white',
                    )}
                    onClick={() => {
                      setCurrentGlobalPath('/');
                    }}
                  >
                    <HomeIcon className="h-3.5 w-3.5" />
                    {t('vectorFs.home')}
                  </button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {splitCurrentPath.map((path, idx) => (
                <React.Fragment key={idx}>
                  <BreadcrumbSeparator>
                    <ChevronRight />
                  </BreadcrumbSeparator>
                  {splitCurrentPath.length - 1 === idx ? (
                    <BreadcrumbPage className="flex items-center gap-1 p-2 font-medium">
                      {path}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <button
                        className="flex items-center gap-1 rounded-full bg-transparent p-2 hover:bg-gray-400"
                        onClick={() => {
                          const buildPath = splitCurrentPath
                            .slice(0, idx + 1)
                            .join('/');
                          setCurrentGlobalPath('/' + buildPath);
                        }}
                      >
                        {path}
                      </button>
                    </BreadcrumbLink>
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}
      <ScrollArea>
        <div
          className={cn(
            'grid flex-1',
            layout === VectorFSLayout.Grid &&
              'grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
            layout === VectorFSLayout.List &&
              'grid-cols-1 divide-y divide-gray-400',
            searchQuery && 'pt-4',
          )}
        >
          {(isVRFilesPending ||
            isSearchVRItemsLoading ||
            (searchQuery && searchQuery !== debouncedSearchQuery)) &&
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                className="mb-1 flex h-[69px] items-center justify-between gap-2 rounded-lg bg-gray-400 py-3"
                key={idx}
              />
            ))}
          {!searchQuery &&
            folderList?.map((folder, index: number) => {
              return (
                <VectorFsFolder
                  folder={folder}
                  handleSelectFolders={handleSelectFolders}
                  isSelectedFolder={selectedFolders.some(
                    (selectedFolder) => selectedFolder.path === folder.path,
                  )}
                  isSharedFolder={sharedFolders?.some(
                    (sharedFolder) => sharedFolder.path === folder.path,
                  )}
                  key={index}
                  onClick={() => {
                    setCurrentGlobalPath(folder.path);
                  }}
                />
              );
            })}
          {!searchQuery &&
            isVRFilesSuccess &&
            itemList?.map((file, index: number) => {
              return (
                <VectorFsItem
                  file={file}
                  handleSelectFiles={handleSelectFiles}
                  isSelectedFile={selectedFiles.some(
                    (selectedFile) => selectedFile.path === file.path,
                  )}
                  key={index}
                  onClick={() => {
                    setSelectedFile(file);
                    setActiveDrawerMenuOption(
                      VectorFsGlobalAction.VectorFileDetails,
                    );
                  }}
                />
              );
            })}
          {!searchQuery &&
            isVRFilesSuccess &&
            VRFiles?.child_folders?.length === 0 &&
            currentGlobalPath === '/' && (
              <div className="text-gray-80 mt-4 flex flex-col items-center justify-center gap-4 text-center text-base">
                <FileEmptyStateIcon className="h-20 w-20" />
                <div>
                  <h2 className="font-medium text-white">
                    {t('vectorFs.emptyState.noFilesAndFolders')}
                  </h2>
                  <span>
                    {t('vectorFs.emptyState.noFilesAndFoldersDescription')}
                  </span>
                </div>
              </div>
            )}
          {!searchQuery &&
            isVRFilesSuccess &&
            VRFiles?.child_items?.length === 0 &&
            VRFiles.child_folders?.length === 0 && (
              <div className="flex h-20 items-center justify-center text-gray-100">
                {t('vectorFs.emptyState.noFiles')}
              </div>
            )}
          {searchQuery &&
            isSearchVRItemsSuccess &&
            searchVRItems?.length === 0 && (
              <div className="flex h-20 items-center justify-center text-gray-100">
                {t('vectorFs.emptyState.noFiles')}
              </div>
            )}
          {searchQuery &&
            isSearchVRItemsSuccess &&
            searchQuery === debouncedSearchQuery &&
            searchVRItems?.map((item) => {
              return (
                <button
                  className="relative flex items-center gap-2 text-ellipsis px-3 py-1.5 hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-400"
                  key={item}
                  onClick={() => {
                    const directoryMainPath = item.split('/').slice(0, -1);
                    setCurrentGlobalPath(
                      directoryMainPath.length > 1
                        ? '/' + directoryMainPath.join('/')
                        : '/' + directoryMainPath,
                    );
                    setSearchQuery('');
                  }}
                >
                  <FileTypeIcon />
                  <span className="text-gray-80 text-sm">
                    {item?.split('/').at(-1)?.replace(/_/g, ' ')}
                  </span>
                </button>
              );
            })}
        </div>
      </ScrollArea>
      <ContextMenu>
        <ContextMenuTrigger className="flex-1">
          <span className="sr-only">{t('common.seeOptions')}</span>
        </ContextMenuTrigger>
        <ContextMenuContent className="p-2">
          {actionList.map((item, index) => (
            <ContextMenuItem
              disabled={item.disabled}
              key={index}
              onClick={item.onClick}
            >
              {item.icon}
              <span>{item.name}</span>
            </ContextMenuItem>
          ))}
        </ContextMenuContent>
      </ContextMenu>

      {/*<div className="fixed bottom-0 left-0 right-0 flex items-center justify-between rounded-t-md bg-gray-300 py-3">*/}
      {/*  <span className="flex flex-1 items-center justify-center gap-1">*/}
      {/*    <FileIcon className="h-4 w-4" />*/}
      {/*    <span className="font-medium">TODO items</span>*/}
      {/*  </span>*/}
      {/*  <span className="flex flex-1 items-center justify-center gap-1">*/}
      {/*    <DatabaseIcon className="h-4 w-4" />*/}
      {/*    <span className="font-medium">TODO</span>*/}
      {/*  </span>*/}
      {/*</div>*/}
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <MotionButton
              className={cn(
                'fixed bottom-16 right-4 h-[60px] w-[60px]',
                isVRSelectionActive && 'w-[210px]',
              )}
              layout
              onClick={() => {
                if (!isVRSelectionActive) {
                  setVRSelectionActive(true);
                } else {
                  navigate('/inboxes/create-job', {
                    state: {
                      selectedVRFiles: selectedFiles,
                      selectedVRFolders: selectedFolders,
                    },
                  });
                }
              }}
              size={isVRSelectionActive ? 'lg' : 'icon'}
              transition={{ duration: 0.2 }}
            >
              {!isVRSelectionActive && <CreateAIIcon />}
              <motion.div
                className={cn(
                  'sr-only flex flex-col',
                  isVRSelectionActive && 'not-sr-only',
                )}
                layout
              >
                <span>{t('chat.create')}</span>
                {isVRSelectionActive && (
                  <span className="text-sm text-neutral-200">
                    {t('vectorFs.filesSelected', {
                      count: selectedFiles.length + selectedFolders.length,
                    })}
                  </span>
                )}
              </motion.div>
            </MotionButton>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent side="left">
              <p>{t('chat.create')}</p>
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
      {isVRSelectionActive && (
        <MotionButton
          animate={{ opacity: 1 }}
          className="fixed bottom-20 right-[230px] h-[24px] w-[24px] border border-gray-100 bg-gray-300 p-1 text-gray-50 hover:bg-gray-500 hover:text-white"
          initial={{ opacity: 0 }}
          onClick={() => setVRSelectionActive(false)}
          size="icon"
          transition={{
            duration: 0.4,
          }}
          variant="outline"
        >
          <span className="sr-only">{t('common.unselectAll')}</span>
          <XIcon />
        </MotionButton>
      )}
    </div>
  );
};
export default AllFiles;
