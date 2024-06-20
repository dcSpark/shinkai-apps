import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { retrieveVectorResource } from '@shinkai_network/shinkai-message-ts/api/methods';
import {
  SearchVectorFormSchema,
  searchVectorFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/vector-fs/vector-search';
import { VRItem } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/types';
import { useGetVRSeachSimplified } from '@shinkai_network/shinkai-node-state/lib/queries/getVRSearchSimplified/useGetSearchVRItems';
import {
  Badge,
  Button,
  buttonVariants,
  Form,
  FormField,
  Input,
  ScrollArea,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { FileTypeIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { motion } from 'framer-motion';
import { SearchIcon, XIcon } from 'lucide-react';
import { Checkbox } from 'primereact/checkbox';
import { TreeCheckboxSelectionKeys } from 'primereact/tree';
import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useLocation } from 'react-router-dom';

import { SimpleLayout } from '../../pages/layout/simple-layout';
import { useAuth } from '../../store/auth';
import {
  FolderSelectionList,
  useVectorFolderSelectionStore,
} from '../vector-fs/components/folder-selection-list';

const SearchNodeFiles = () => {
  const location = useLocation();
  const locationState = location.state as {
    folderPath: string;
  };
  const { t } = useTranslation();

  const auth = useAuth((state) => state.auth);
  const [selectedKeys, setSelectedKeys] =
    useState<TreeCheckboxSelectionKeys | null>(null);
  const selectedFileKeysRef = useRef<Map<string, VRItem>>(new Map());

  const setDestinationFolderPath = useVectorFolderSelectionStore(
    (state) => state.setDestinationFolderPath,
  );
  const destinationFolderPath = useVectorFolderSelectionStore(
    (state) => state.destinationFolderPath,
  );

  const searchVectorFSForm = useForm<SearchVectorFormSchema>({
    resolver: zodResolver(searchVectorFormSchema),
    defaultValues: {
      searchQuery: '',
    },
  });
  const [search, setSearch] = useState('');

  const [isSearchEntered, setIsSearchEntered] = useState(false);

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
      path: destinationFolderPath ?? undefined,
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
  const groupedData = data?.reduce<Record<string, string[]>>(
    (acc, [content, pathList]) => {
      const generatedFilePath = '/' + pathList.join('/');
      if (!acc[generatedFilePath]) {
        acc[generatedFilePath] = [];
      }
      acc[generatedFilePath].push(content);
      return acc;
    },
    {},
  );

  useEffect(() => {
    if (locationState?.folderPath) {
      setDestinationFolderPath(locationState.folderPath);
    }
  }, [locationState?.folderPath, setDestinationFolderPath]);

  return (
    <SimpleLayout>
      <div
        className={cn(
          'flex h-[calc(100vh_-_80px)] flex-col justify-start space-y-3',
          !isSearchEntered && 'overflow-hidden',
        )}
      >
        <motion.div
          animate={{
            y: isSearchEntered ? '0%' : '30vh',
            from: '20vh',
          }}
          initial={false}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 100,
          }}
        >
          <h1 className="text-center text-2xl font-semibold text-white">
            {t('aiFilesSearch.label')}
          </h1>
          <p className="text-gray-80 mx-auto text-center text-sm">
            {t('aiFilesSearch.description')}
          </p>
          <Form {...searchVectorFSForm}>
            <form
              className="flex shrink-0 flex-col items-center gap-2 pt-4"
              onSubmit={searchVectorFSForm.handleSubmit(onSubmit)}
            >
              <div className="flex w-full flex-1 items-center gap-2">
                <FormField
                  control={searchVectorFSForm.control}
                  name="searchQuery"
                  render={({ field }) => (
                    <div className="relative flex-1">
                      <Input
                        autoFocus
                        className="placeholder-gray-80 !h-[50px] bg-gray-200 py-2 pl-10"
                        onChange={field.onChange}
                        placeholder={t('common.searchPlaceholder')}
                        value={field.value}
                      />
                      <SearchIcon className="absolute left-4 top-1/2 -z-[1px] h-4 w-4 -translate-y-1/2" />
                      {currentSearchQuery && (
                        <Button
                          className="absolute right-1 top-2 h-8 w-8 bg-gray-200 p-2"
                          onClick={() => {
                            searchVectorFSForm.reset({ searchQuery: '' });
                          }}
                          size="auto"
                          type="button"
                          variant="ghost"
                        >
                          <XIcon />
                          <span className="sr-only">
                            {t('common.clearSearch')}
                          </span>
                        </Button>
                      )}
                    </div>
                  )}
                />
                <Button
                  className="h-[48px] w-[48px] shrink-0 rounded-xl p-3.5"
                  disabled={isPending && isLoading}
                  isLoading={isPending && isLoading}
                  size="auto"
                  type="submit"
                >
                  <SearchIcon />
                  <span className="sr-only">{t('common.search')}</span>
                </Button>
              </div>

              <div className="flex items-center gap-2 self-start px-2 py-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-80 text-xs">
                    {t('common.folderLocation')}
                  </span>
                  <SelectFolderButton />
                </div>
                <div className="flex items-center">
                  {!(
                    destinationFolderPath == null ||
                    destinationFolderPath === '/'
                  ) && (
                    <Button
                      className="underline"
                      onClick={() => {
                        setDestinationFolderPath(null);
                      }}
                      size="sm"
                      type="button"
                      variant="link"
                    >
                      {t('common.resetFilters')}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </motion.div>
        {isSearchEntered &&
          isLoading &&
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              className="mb-1 flex h-[69px] items-center justify-between gap-2 rounded-lg bg-gray-400 py-3"
              key={idx}
            />
          ))}
        {isSearchEntered && isSuccess && (
          <div className="flex min-h-[50px] items-center justify-between gap-4 px-2">
            <h2 className="text-gray-80 text-sm font-medium">
              Found {data?.length} results
            </h2>
            {selectedKeys && Object.keys(selectedKeys).length > 0 && (
              <div className="space-x-2">
                <Link
                  className={cn(
                    buttonVariants({
                      size: 'sm',
                      variant: 'outline',
                    }),
                    'gap-1.5 px-5',
                  )}
                  state={{
                    selectedVRFiles: Array.from(
                      selectedFileKeysRef.current.values(),
                    ),
                  }}
                  to="/create-job"
                >
                  <span className="text-sm">Create AI Chat</span>
                  <Badge
                    className="bg-brand text-xs font-medium"
                    variant="inputAdornment"
                  >
                    {Object.keys(selectedKeys).length}
                  </Badge>
                </Link>
              </div>
            )}
          </div>
        )}

        {isSearchEntered && isSuccess && (
          <ScrollArea className="pr-4 [&>div>div]:!block">
            <div className="flex flex-col gap-2 divide-y divide-slate-600">
              {isSearchEntered && isSuccess && (
                <div className="flex flex-col gap-2">
                  {Object.entries(groupedData ?? {}).map(
                    ([generatedFilePath, contents]) => (
                      <div
                        className="flex items-start gap-1 px-2 py-3 text-sm"
                        key={generatedFilePath}
                      >
                        <Checkbox
                          checked={generatedFilePath in (selectedKeys || {})}
                          inputId={generatedFilePath}
                          name="files"
                          onChange={async (event) => {
                            const newKeys = { ...selectedKeys };
                            if (event.value in (selectedKeys || {})) {
                              delete newKeys[event.value];
                            } else {
                              newKeys[event.value] = { checked: true };
                              const fileInfo = await retrieveVectorResource(
                                auth?.node_address ?? '',
                                auth?.shinkai_identity ?? '',
                                auth?.profile ?? '',
                                auth?.shinkai_identity ?? '',
                                auth?.profile ?? '',
                                generatedFilePath,
                                {
                                  my_device_encryption_sk:
                                    auth?.my_device_encryption_sk ?? '',
                                  my_device_identity_sk:
                                    auth?.my_device_identity_sk ?? '',
                                  node_encryption_pk:
                                    auth?.node_encryption_pk ?? '',
                                  profile_encryption_sk:
                                    auth?.profile_encryption_sk ?? '',
                                  profile_identity_sk:
                                    auth?.profile_identity_sk ?? '',
                                },
                              );

                              selectedFileKeysRef.current.set(event.value, {
                                ...fileInfo.data,
                                path: event.value,
                                vr_header: {
                                  resource_name: fileInfo.data.name,
                                  resource_source: fileInfo.data.source,
                                },
                              });
                            }
                            setSelectedKeys(newKeys);
                          }}
                          value={generatedFilePath}
                        />
                        <label
                          className="ml-2 flex-1"
                          htmlFor={generatedFilePath}
                        >
                          <div className="flex items-center gap-1">
                            <FileTypeIcon className="h-6 w-6" />
                            <span className="text-sm">
                              {generatedFilePath.split('/').at(-1)}
                            </span>
                          </div>
                          <div className="divide-y divide-gray-300">
                            {contents?.map((content) => (
                              <p
                                className="text-gray-80 py-3 text-xs"
                                key={content}
                              >
                                {content}
                              </p>
                            ))}
                          </div>
                        </label>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </SimpleLayout>
  );
};

export default SearchNodeFiles;

function SelectFolderButton() {
  const destinationFolderPath = useVectorFolderSelectionStore(
    (state) => state.destinationFolderPath,
  );
  const setDestinationFolderPath = useVectorFolderSelectionStore(
    (state) => state.setDestinationFolderPath,
  );

  const selectedFolderLabel =
    destinationFolderPath == null || destinationFolderPath === '/'
      ? 'Anywhere'
      : destinationFolderPath.split('/').at(-1);

  const selectedFolderPath =
    destinationFolderPath == null || destinationFolderPath === '/'
      ? 'Anywhere in your AI Files'
      : destinationFolderPath;

  return (
    <Sheet>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <SheetTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                className="hover:bg-gray-400 hover:text-white"
                size="sm"
                type="button"
                variant="outline"
              >
                {selectedFolderLabel}
              </Button>
            </TooltipTrigger>
          </SheetTrigger>
          <TooltipPortal>
            <TooltipContent>
              <p>{selectedFolderPath}</p>
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Select a Folder</SheetTitle>
        </SheetHeader>
        <FolderSelectionList />
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button">Select</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button
              onClick={() => {
                setDestinationFolderPath(null);
              }}
              type="button"
              variant="outline"
            >
              Reset Filters
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
