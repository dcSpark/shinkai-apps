import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Form,
  FormField,
  Input,
  ScrollArea,
} from '@shinkai_network/shinkai-ui';
import { FileTypeIcon } from '@shinkai_network/shinkai-ui/assets';
import { SearchIcon, XIcon } from 'lucide-react';
import { Checkbox } from 'primereact/checkbox';
import { Tree, TreeCheckboxSelectionKeys } from 'primereact/tree';
import { TreeNode } from 'primereact/treenode';
import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useAuth } from '../../store/auth/auth';
import { treeOptions } from './constants';

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
  const { t } = useTranslation();
  return (
    <Drawer onOpenChange={onVectorFSOpenChanges} open={isVectorFSOpen}>
      <DrawerContent>
        <DrawerClose className="absolute right-4 top-5">
          <XIcon className="text-gray-80" />
        </DrawerClose>
        <DrawerHeader className="mb-3">
          <DrawerTitle className="flex h-[40px] items-center gap-4">
            {t('chat.form.setContext')}
            {Object.keys(selectedKeys ?? {}).length > 0 && (
              <Badge className="bg-brand text-sm text-white">
                {Object.keys(selectedKeys ?? {}).length}
              </Badge>
            )}
          </DrawerTitle>
          <p className="text-gray-80 text-sm">
            {t('chat.form.setContextText')}
          </p>
        </DrawerHeader>

        <ScrollArea className="h-[60vh]">
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

        <DrawerFooter>
          <Button
            onClick={() => {
              onSelectedKeysChange(null);
            }}
            type="button"
            variant="outline"
          >
            {t('common.unselectAll')}
          </Button>
          <Button
            onClick={() => {
              onVectorFSOpenChanges(false);
            }}
            type="button"
          >
            {t('common.done')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
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
  const { t } = useTranslation();

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
    <Drawer
      onClose={() => {
        setIsSearchEntered(false);
        searchVectorFSForm.reset({ searchQuery: '' });
      }}
      onOpenChange={setIsKnowledgeSearchOpen}
      open={isKnowledgeSearchOpen}
    >
      <DrawerContent>
        <DrawerClose className="absolute right-4 top-5">
          <XIcon className="text-gray-80" />
        </DrawerClose>
        <DrawerHeader className="mb-3">
          <DrawerTitle className="flex h-[40px] items-center gap-4">
            {t('aiFilesSearch.label')}
            {/*{Object.keys(selectedKeys ?? {}).length > 0 && (*/}
            {/*  <Badge className="bg-brand text-sm text-white">*/}
            {/*    {Object.keys(selectedKeys ?? {}).length}*/}
            {/*  </Badge>*/}
            {/*)}*/}
          </DrawerTitle>
          <p className="text-gray-80 text-sm">
            {t('aiFilesSearch.description')}
          </p>
        </DrawerHeader>

        <Form {...searchVectorFSForm}>
          <form
            className="mb-4 flex flex-1 shrink-0 items-center gap-2 pt-4"
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
                    placeholder={t('common.search')}
                    value={field.value}
                  />
                  <SearchIcon className="absolute left-4 top-1/2 -z-[1px] h-4 w-4 -translate-y-1/2 bg-gray-300" />
                  {currentSearchQuery && (
                    <Button
                      className="absolute right-1 h-8 w-8 bg-gray-200 p-2"
                      onClick={() => {
                        searchVectorFSForm.reset({ searchQuery: '' });
                        setIsSearchEntered(false);
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
              )}
            />
            <Button
              className="h-12 w-12 rounded-lg"
              disabled={isPending && isLoading}
              isLoading={isPending && isLoading}
              size="icon"
              type="submit"
            >
              <SearchIcon />
              <span className="sr-only">{t('common.search')}</span>
            </Button>
          </form>
        </Form>
        <ScrollArea className="h-[50vh] pr-4 [&>div>div]:!block">
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
                <h2 className="text-gray-80 font-medium">
                  {t('aiFilesSearch.foundResults', {
                    count: data?.length,
                  })}
                </h2>
                {selectedKeys && Object.keys(selectedKeys).length > 0 && (
                  <span className="text-brand font-medium">
                    {t('aiFilesSearch.filesSelected', {
                      count: Object.keys(selectedKeys).length,
                    })}
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
        <DrawerFooter>
          <Button
            onClick={() => {
              onSelectedKeysChange(null);
              selectedFileKeysRef.current.clear();
            }}
            type="button"
            variant="outline"
          >
            {t('common.unselectAll')}
          </Button>
          <Button
            onClick={() => {
              setIsKnowledgeSearchOpen(false);
            }}
            type="button"
          >
            {t('common.done')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
