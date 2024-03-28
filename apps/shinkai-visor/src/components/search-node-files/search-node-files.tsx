import { useGetVRSeachSimplified } from '@shinkai_network/shinkai-node-state/lib/queries/getVRSearchSimplified/useGetSearchVRItems';
import {
  Button,
  Form,
  FormField,
  Input,
  ScrollArea,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { motion } from 'framer-motion';
import { SearchIcon, XIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { useAuth } from '../../store/auth/auth';

const searchVectorFSSchema = z.object({
  searchQuery: z.string().min(1, 'Search query is required'),
});
const SearchNodeFiles = () => {
  const auth = useAuth((state) => state.auth);
  const searchVectorFSForm = useForm<z.infer<typeof searchVectorFSSchema>>({
    defaultValues: {
      searchQuery: '',
    },
  });

  const [isSearchEntered, setIsSearchEntered] = useState(false);

  const currentSearchQuery = useWatch({
    control: searchVectorFSForm.control,
    name: 'searchQuery',
  });

  const { isLoading, isSuccess, data, refetch } = useGetVRSeachSimplified(
    {
      nodeAddress: auth?.node_address ?? '',
      search: searchVectorFSForm.getValues('searchQuery'),
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      profile: auth?.profile ?? '',
      my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
      my_device_identity_sk: auth?.my_device_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    },
    {
      enabled: isSearchEntered,
      refetchOnWindowFocus: false,
    },
  );

  const onSubmit = async (data: z.infer<typeof searchVectorFSSchema>) => {
    setIsSearchEntered(true);
    refetch();
  };

  useEffect(() => {
    if (!currentSearchQuery) {
      setIsSearchEntered(false);
    }
  }, [currentSearchQuery]);

  return (
    <div
      className={cn(
        'flex h-full flex-col justify-start space-y-3',
        !isSearchEntered && 'overflow-hidden',
      )}
    >
      <motion.div
        animate={{
          y: isSearchEntered ? '0%' : '35vh',
        }}
        transition={{
          type: 'spring',
          damping: 15,
          stiffness: 100,
        }}
      >
        <h1 className="text-center text-2xl font-semibold text-white">
          Shinkai FS Knowledge
        </h1>
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
              className="h-10 min-w-[100px] rounded-lg"
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
            className="mb-1 flex h-[69px] items-center justify-between gap-2 bg-gray-400 py-3"
            key={idx}
          />
        ))}
      {isSearchEntered && isSuccess && (
        <ScrollArea className="pr-4 [&>div>div]:!block">
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
        </ScrollArea>
      )}
    </div>
  );
};

export default SearchNodeFiles;
