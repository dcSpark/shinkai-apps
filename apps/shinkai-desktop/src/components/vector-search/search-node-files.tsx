import { zodResolver } from '@hookform/resolvers/zod';
import {
  SearchVectorFormSchema,
  searchVectorFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/vector-fs/vector-search';
import { useGetVRSeachSimplified } from '@shinkai_network/shinkai-node-state/lib/queries/getVRSearchSimplified/useGetSearchVRItems';
import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
  Form,
  FormField,
  Input,
  ScrollArea,
  SheetHeader,
  SheetTitle,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { motion } from 'framer-motion';
import { SearchIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { SimpleLayout } from '../../pages/layout/simple-layout';
import { useAuth } from '../../store/auth';
import {
  FolderSelectionList,
  useVectorFolderSelectionStore,
} from '../vector-fs/components/folder-selection-list';

const SearchNodeFiles = () => {
  const auth = useAuth((state) => state.auth);
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

  return (
    <SimpleLayout>
      <div
        className={cn(
          'flex h-[calc(100vh_-_120px)] flex-col justify-start space-y-3',
          !isSearchEntered && 'overflow-hidden',
        )}
      >
        <motion.div
          animate={{
            y: isSearchEntered ? '0%' : '30vh',
            from: '20vh',
          }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 100,
          }}
        >
          <h1 className="text-center text-2xl font-semibold text-white">
            AI Files Content Search
          </h1>
          <p className="text-gray-80 mx-auto text-center text-sm">
            Search to find content across all files in your AI Files easily
          </p>
          <Form {...searchVectorFSForm}>
            <form
              className="flex shrink-0 flex-col items-center gap-2 pt-4"
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
                    <SearchIcon className="absolute left-4 top-1/2 -z-[1px] h-4 w-4 -translate-y-1/2" />
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
              <div className="flex items-center gap-4 self-start px-2 py-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-80 text-xs">Folder Location:</span>
                  <SelectFolderButton />
                </div>
              </div>
              <Button
                className="w-1/2 rounded-xl"
                disabled={isPending && isLoading}
                isLoading={isPending && isLoading}
                size="lg"
                type="submit"
              >
                <span className="">Search</span>
              </Button>
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
          <ScrollArea className="pr-4 [&>div>div]:!block">
            <div className="flex items-center">
              <h2 className="p-2 text-base font-medium text-gray-50">
                Found {data?.length} results
              </h2>
              {!(
                destinationFolderPath == null || destinationFolderPath === '/'
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
                  Reset Filters
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-2 divide-y divide-slate-600">
              {data?.map(([content, pathList, score], idx) => (
                <div className="flex flex-col gap-1 px-2 py-3" key={idx}>
                  <p className="text-sm text-white">{content}</p>
                  <div className="text-gray-80 flex justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <span>Source:</span>
                      <Link
                        className={'underline'}
                        to={{
                          pathname: '/vector-fs',
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
    <Drawer>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <DrawerTrigger asChild>
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
          </DrawerTrigger>
          <TooltipPortal>
            <TooltipContent>
              <p>{selectedFolderPath}</p>
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>

      <DrawerContent>
        <DrawerClose className="absolute right-4 top-5">
          <XIcon className="text-gray-80" />
        </DrawerClose>
        <SheetHeader>
          <SheetTitle>Select a Folder</SheetTitle>
        </SheetHeader>
        <FolderSelectionList />
        <DrawerFooter>
          <DrawerClose asChild>
            <Button type="button">Select</Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button
              onClick={() => {
                setDestinationFolderPath(null);
              }}
              type="button"
              variant="outline"
            >
              Reset Filters
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
