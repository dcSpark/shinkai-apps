import { zodResolver } from '@hookform/resolvers/zod';
import { retrieveVectorResource } from '@shinkai_network/shinkai-message-ts/api';
import {
  SearchVectorFormSchema,
  searchVectorFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/vector-fs/vector-search';
import {
  VRFolder,
  VRItem,
} from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/types';
import { useGetVRSeachSimplified } from '@shinkai_network/shinkai-node-state/lib/queries/getVRSearchSimplified/useGetSearchVRItems';
import {
  Badge,
  Button,
  Form,
  FormField,
  Input,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@shinkai_network/shinkai-ui';
import { FileTypeIcon } from '@shinkai_network/shinkai-ui/assets';
import { SearchIcon, XIcon } from 'lucide-react';
import { Checkbox } from 'primereact/checkbox';
import { Tree, TreeCheckboxSelectionKeys } from 'primereact/tree';
import { TreeNode } from 'primereact/treenode';
import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { treeOptions } from '../../../lib/constants';
import { useAuth } from '../../../store/auth';

export const VectorFsScopeDrawer = ({
  isVectorFSOpen,
  onVectorFSOpenChanges,
  selectedKeys,
  selectedFileKeysRef,
  selectedFolderKeysRef,
  onSelectedKeysChange,
  nodes,
}: {
  isVectorFSOpen: boolean;
  onVectorFSOpenChanges: (value: boolean) => void;
  selectedKeys: TreeCheckboxSelectionKeys | null;
  selectedFileKeysRef: React.MutableRefObject<Map<string, VRItem>>;
  selectedFolderKeysRef: React.MutableRefObject<Map<string, VRFolder>>;
  onSelectedKeysChange: (value: TreeCheckboxSelectionKeys | null) => void;
  nodes: TreeNode[];
}) => {
  return (
    <Sheet onOpenChange={onVectorFSOpenChanges} open={isVectorFSOpen}>
      <SheetContent>
        {/*<DrawerClose className="absolute right-4 top-5">*/}
        {/*  <XIcon className="text-gray-80" />*/}
        {/*</DrawerClose>*/}
        <SheetHeader className="mb-3">
          <SheetTitle className="flex h-[40px] items-center gap-4">
            Set Context
            {Object.keys(selectedKeys ?? {}).length > 0 && (
              <Badge className="bg-brand text-sm text-white">
                {Object.keys(selectedKeys ?? {}).length}
              </Badge>
            )}
          </SheetTitle>
          <p className="text-gray-80 text-sm">
            Add local files and folders to use as context for your conversation
          </p>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-260px)] flex-1">
          <Tree
            onSelect={(e) => {
              if (e.node.icon === 'icon-folder') {
                selectedFolderKeysRef.current.set(
                  String(e.node.key),
                  e.node.data,
                );
                return;
              }
              selectedFileKeysRef.current.set(String(e.node.key), e.node.data);
            }}
            onSelectionChange={(e) => {
              onSelectedKeysChange(e.value as TreeCheckboxSelectionKeys);
            }}
            onUnselect={(e) => {
              if (e.node.icon === 'icon-folder') {
                selectedFolderKeysRef.current.delete(String(e.node.key));
                return;
              }
              selectedFileKeysRef.current.delete(String(e.node.key));
            }}
            propagateSelectionDown={false}
            propagateSelectionUp={false}
            pt={treeOptions}
            selectionKeys={selectedKeys}
            selectionMode="checkbox"
            value={nodes}
          />
        </ScrollArea>

        <SheetFooter>
          <Button
            onClick={() => {
              onSelectedKeysChange(null);
            }}
            type="button"
            variant="outline"
          >
            Deselect All
          </Button>
          <Button
            onClick={() => {
              onVectorFSOpenChanges(false);
            }}
            type="button"
          >
            Done
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export const KnowledgeSearchDrawer = ({
  isKnowledgeSearchOpen,
  setIsKnowledgeSearchOpen,
  selectedKeys,
  onSelectedKeysChange,
  selectedFileKeysRef,
}: {
  isKnowledgeSearchOpen: boolean;
  setIsKnowledgeSearchOpen: (value: boolean) => void;
  selectedKeys: TreeCheckboxSelectionKeys | null;
  onSelectedKeysChange: (value: TreeCheckboxSelectionKeys | null) => void;
  selectedFileKeysRef: React.MutableRefObject<Map<string, VRItem>>;
}) => {
  const auth = useAuth((state) => state.auth);
  const [isSearchEntered, setIsSearchEntered] = useState(false);
  const [search, setSearch] = useState('');
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

  return (
    <Sheet onOpenChange={setIsKnowledgeSearchOpen} open={isKnowledgeSearchOpen}>
      <SheetContent>
        <SheetHeader className="mb-3">
          <SheetTitle className="flex h-[40px] items-center gap-4">
            AI Files Content Search
          </SheetTitle>
          <p className="text-gray-80 text-sm">
            Search to find content across all files in your AI Files easily
          </p>
        </SheetHeader>

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
                      placeholder="Search anything..."
                      value={field.value}
                    />
                    <SearchIcon className="absolute left-4 top-1/2 -z-[1px] h-4 w-4 -translate-y-1/2 bg-gray-300" />
                    {currentSearchQuery && (
                      <Button
                        className="absolute right-1 top-2 h-8 w-8 bg-gray-200 p-2"
                        onClick={() => {
                          searchVectorFSForm.reset({ searchQuery: '' });
                          setIsSearchEntered(false);
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
                className="h-[48px] w-[48px] shrink-0 rounded-xl p-3.5"
                disabled={isPending && isLoading}
                isLoading={isPending && isLoading}
                size="auto"
                type="submit"
              >
                <SearchIcon />
                <span className="sr-only">Search</span>
              </Button>
            </div>
          </form>
        </Form>
        <ScrollArea className="h-[calc(100vh-340px)] pr-4 [&>div>div]:!block">
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
              <div className="flex items-center justify-between gap-4 p-2">
                <h2 className="text-gray-80 text-sm font-medium">
                  Found {data?.length} results
                </h2>
                {selectedKeys && Object.keys(selectedKeys).length > 0 && (
                  <span className="text-brand text-sm font-medium">
                    Selected {Object.keys(selectedKeys).length} files
                  </span>
                )}
              </div>
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
                          onSelectedKeysChange(newKeys);
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
            </div>
          )}
        </ScrollArea>
        <SheetFooter>
          <Button
            onClick={() => {
              onSelectedKeysChange(null);
              selectedFileKeysRef.current.clear();
            }}
            type="button"
            variant="outline"
          >
            Deselect All
          </Button>
          <Button
            onClick={() => {
              setIsKnowledgeSearchOpen(false);
            }}
            type="button"
          >
            Done
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
