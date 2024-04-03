import { zodResolver } from '@hookform/resolvers/zod';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/lib/mutations/createJob/useCreateJob';
import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import {
  VRFolder,
  VRItem,
} from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/types';
import { useGetVRPathSimplified } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/useGetVRPathSimplified';
import {
  Badge,
  Button,
  DirectoryTypeIcon,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  FilesIcon,
  FileTypeIcon,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@shinkai_network/shinkai-ui';
import { SearchCode, XIcon } from 'lucide-react';
import { Tree, TreeCheckboxSelectionKeys } from 'primereact/tree';
import { TreeNode } from 'primereact/treenode';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory, useLocation } from 'react-router-dom';
import { z } from 'zod';

import { useQuery } from '../../hooks/use-query';
import { useAuth } from '../../store/auth/auth';
import { useSettings } from '../../store/settings/settings';
import { FileInput } from '../file-input/file-input';
import { Header } from '../header/header';
import { allowedFileExtensions, treeOptions } from './constants';

function transformDataToTreeNodes(
  data: VRFolder,
  parentPath: string = '/',
): TreeNode[] {
  const result: TreeNode[] = [];

  for (const folder of data?.child_folders ?? []) {
    const folderNode: TreeNode = {
      key: folder.path,
      label: folder.name,
      data: folder,
      icon: 'icon-folder',
      children: transformDataToTreeNodes(folder, folder.path),
    };
    result.push(folderNode);
  }

  for (const item of data.child_items ?? []) {
    const itemNode: TreeNode = {
      key: item.path,
      label: item.name,
      data: item,
      icon: 'icon-file',
    };
    result.push(itemNode);
  }

  return result;
}

const formSchema = z.object({
  agent: z.string().min(1),
  content: z.string().min(1),
  files: z.array(z.any()).max(3),
  selectedVRFiles: z.array(z.any()).optional(),
  selectedVRFolders: z.array(z.any()).optional(),
});

type FormSchemaType = z.infer<typeof formSchema>;

export const CreateJob = () => {
  const history = useHistory();
  const intl = useIntl();
  const location = useLocation<{
    files: File[];
    agentName: string;
    selectedVRFiles: VRItem[];
    selectedVRFolders: VRFolder[];
  }>();
  const query = useQuery();
  const auth = useAuth((state) => state.auth);

  const selectedFileKeysRef = useRef<Map<string, VRItem>>(new Map());
  const selectedFolderKeysRef = useRef<Map<string, VRFolder>>(new Map());
  // const settings = useSettings((state) => state.settings);
  const currentDefaultAgentId = useSettings((state) => state.defaultAgentId);
  const {
    // isPending: isVRFilesPending,
    data: VRFiles,
    isSuccess: isVRFilesSuccess,
  } = useGetVRPathSimplified({
    nodeAddress: auth?.node_address ?? '',
    profile: auth?.profile ?? '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    path: '/',
    my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
    my_device_identity_sk: auth?.profile_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agent: '',
      content: query.get('initialText') ?? '',
      files: [],
    },
  });
  const { agents } = useAgents({
    nodeAddress: auth?.node_address ?? '',
    sender: auth?.shinkai_identity ?? '',
    senderSubidentity: `${auth?.profile}`,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
    my_device_identity_sk: auth?.profile_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });
  const { isPending, mutateAsync: createJob } = useCreateJob({
    onSuccess: (data) => {
      const jobId = encodeURIComponent(buildInboxIdFromJobId(data.jobId));
      history.replace(`/inboxes/${jobId}`);
    },
  });
  const [isFolderSelectionOpen, setIsFolderSelectionOpen] =
    React.useState(false);

  useEffect(() => {
    form.setValue('files', location?.state?.files || []);
    form.setValue('selectedVRFiles', location?.state?.selectedVRFiles || []);
    form.setValue(
      'selectedVRFolders',
      location?.state?.selectedVRFolders || [],
    );
  }, [location, form]);

  useEffect(() => {
    if (!location?.state?.agentName) {
      return;
    }
    const agent = agents.find((agent) => agent.id === location.state.agentName);
    if (agent) {
      form.setValue('agent', agent.id);
    }
  }, [form, location, agents]);
  useEffect(() => {
    if (form.getValues().agent) {
      return;
    }
    let defaultAgentId = '';
    defaultAgentId =
      defaultAgentId ||
      (currentDefaultAgentId &&
      agents.find((agent) => agent.id === currentDefaultAgentId)
        ? currentDefaultAgentId
        : '');
    defaultAgentId = defaultAgentId || (agents?.length ? agents[0].id : '');
    form.setValue('agent', defaultAgentId);
  }, [form, location, agents, currentDefaultAgentId]);

  useEffect(() => {
    if (query.get('initialText')) {
      form.handleSubmit(submit)();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const submit = async (values: FormSchemaType) => {
    if (!auth) return;
    let content = values.content;
    if (query.has('context')) {
      content = `${values.content} - \`\`\`${query.get('context')}\`\`\``;
    }
    const selectedVRFiles =
      selectedFileKeysRef.current.size > 0
        ? Array.from(selectedFileKeysRef.current.values())
        : values.selectedVRFiles;
    const selectedVRFolders =
      selectedFolderKeysRef.current.size > 0
        ? Array.from(selectedFolderKeysRef.current.values())
        : values.selectedVRFolders;

    await createJob({
      nodeAddress: auth?.node_address ?? '',
      shinkaiIdentity: auth.shinkai_identity,
      profile: auth.profile,
      agentId: values.agent,
      content: content,
      files_inbox: '',
      files: values.files,
      is_hidden: false,
      selectedVRFiles,
      selectedVRFolders,
      my_device_encryption_sk: auth.my_device_encryption_sk,
      my_device_identity_sk: auth.my_device_identity_sk,
      node_encryption_pk: auth.node_encryption_pk,
      profile_encryption_sk: auth.profile_encryption_sk,
      profile_identity_sk: auth.profile_identity_sk,
    });
  };

  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [selectedKeys, setSelectedKeys] =
    useState<TreeCheckboxSelectionKeys | null>(null);

  useEffect(() => {
    if (isVRFilesSuccess) {
      setNodes(transformDataToTreeNodes(VRFiles));
    }
  }, [isVRFilesSuccess]);

  return (
    <div className="flex h-full flex-col space-y-3">
      <Header title={<FormattedMessage id="create-job" />} />
      <Form {...form}>
        <form
          className="flex grow flex-col justify-between space-y-2 overflow-hidden"
          onSubmit={form.handleSubmit(submit)}
        >
          <ScrollArea className="pr-4 [&>div>div]:!block">
            <FormField
              control={form.control}
              name="agent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage id="agent.one" />
                  </FormLabel>
                  <Select
                    defaultValue={field.value}
                    name={field.name}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {agents?.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="files"
              render={({ field }) => (
                <FormItem className="mt-3">
                  <FormLabel className="sr-only">
                    <FormattedMessage id="file.one" />
                  </FormLabel>
                  <FormControl>
                    <FileInput
                      extensions={allowedFileExtensions}
                      multiple
                      onValueChange={field.onChange}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {query.has('context') && (
              <div className="my-4">
                <blockquote className="border-l-4 border-gray-200 bg-gray-300 py-2.5 pl-3 pr-3">
                  <span className="text-gray-80 font-medium">
                    Your selected text
                  </span>
                  <p className="line-clamp-2 h-full text-white">
                    {query.get('context')}
                  </p>
                </blockquote>
              </div>
            )}

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="mt-3">
                  <FormLabel>
                    <FormattedMessage id="message.one" />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      autoFocus
                      className="resize-none"
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter' &&
                          (event.metaKey || event.ctrlKey)
                        ) {
                          form.handleSubmit(submit)();
                        }
                      }}
                      placeholder={intl.formatMessage({
                        id: 'tmwtd',
                      })}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="my-3 bg-gray-400 px-3 py-3">
              <h2 className="text-gray-80 mb-2 text-xs font-medium">
                Set Context
              </h2>
              <div className="flex flex-col gap-1.5">
                <Button
                  className="flex h-[40px] items-center justify-between gap-2 rounded-lg p-2.5 text-left"
                  onClick={() => setIsFolderSelectionOpen(true)}
                  size="auto"
                  type="button"
                  variant="outline"
                >
                  <div className="flex items-center gap-2">
                    <FilesIcon className="h-4 w-4" />
                    <p className="text-sm text-white">Local Vector Files</p>
                  </div>
                  {Object.keys(selectedKeys ?? {}).length > 0 && (
                    <Badge className="bg-brand text-white">
                      {Object.keys(selectedKeys ?? {}).length}
                    </Badge>
                  )}
                </Button>
                {/*<Button*/}
                {/*  className="flex items-center justify-between gap-2 rounded-lg p-2.5 text-left"*/}
                {/*  onClick={() => setIsFolderSelectionOpen(true)}*/}
                {/*  size="auto"*/}
                {/*  type="button"*/}
                {/*  variant="outline"*/}
                {/*>*/}
                {/*  <div className="flex items-center gap-2">*/}
                {/*    <SearchCode className="h-4 w-4" />*/}
                {/*    <p className="text-sm text-white">Search Knowledge</p>*/}
                {/*  </div>*/}
                {/*  {Object.keys(selectedKeys ?? {}).length > 0 && (*/}
                {/*    <Badge className="bg-brand text-white">*/}
                {/*      {Object.keys(selectedKeys ?? {}).length}*/}
                {/*    </Badge>*/}
                {/*  )}*/}
                {/*</Button>*/}
              </div>
            </div>

            <Drawer
              onOpenChange={setIsFolderSelectionOpen}
              open={isFolderSelectionOpen}
            >
              <DrawerContent>
                <DrawerClose className="absolute right-4 top-5">
                  <XIcon className="text-gray-80" />
                </DrawerClose>
                <DrawerHeader>
                  <DrawerTitle className="mb-4 flex h-[40px] items-center gap-4">
                    Set Context
                    {Object.keys(selectedKeys ?? {}).length > 0 && (
                      <Badge className="bg-brand text-sm text-white">
                        {Object.keys(selectedKeys ?? {}).length}
                      </Badge>
                    )}
                  </DrawerTitle>
                </DrawerHeader>
                <Tabs
                  defaultValue="vector-fs"
                  onValueChange={() => {
                    setSelectedKeys(null);
                  }}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      className="flex items-center gap-1.5"
                      value="vector-fs"
                    >
                      <FilesIcon className="h-4 w-4" />
                      Vector FS
                    </TabsTrigger>
                    <TabsTrigger
                      className="flex items-center gap-1.5"
                      value="search"
                    >
                      <SearchCode className="h-4 w-4" />
                      Knowledge Search
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent className="h-full" value="vector-fs">
                    <p className="text-gray-80 px-2 pt-4 text-center text-sm">
                      Add local files and folders to use as context for your
                      conversation
                    </p>
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
                          selectedFileKeysRef.current.set(
                            String(e.node.key),
                            e.node.data,
                          );
                        }}
                        onSelectionChange={(e) => {
                          setSelectedKeys(e.value as TreeCheckboxSelectionKeys);
                        }}
                        onUnselect={(e) => {
                          if (e.node.icon === 'icon-folder') {
                            selectedFolderKeysRef.current.delete(
                              String(e.node.key),
                            );
                            return;
                          }
                          selectedFileKeysRef.current.delete(
                            String(e.node.key),
                          );
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
                        isLoading={isPending}
                        onClick={() => {
                          setSelectedKeys(null);
                        }}
                        variant="outline"
                      >
                        Deselect All
                      </Button>
                      <Button
                        isLoading={isPending}
                        onClick={() => {
                          setIsFolderSelectionOpen(false);
                        }}
                      >
                        Done
                      </Button>
                    </DrawerFooter>
                  </TabsContent>
                  <TabsContent value="search">
                    <p className="text-gray-80 px-2 pt-4 text-center text-sm">
                      Search to find content across all files in your Vector
                      File System easily
                    </p>
                    <ScrollArea className="h-[60vh]">
                      <div className="flex h-full items-center justify-center">
                        <p className="text-gray-80 text-lg">Coming Soon</p>
                      </div>
                    </ScrollArea>
                    <DrawerFooter>
                      <Button
                        isLoading={isPending}
                        onClick={() => {
                          setSelectedKeys(null);
                          selectedFileKeysRef.current.clear();
                          selectedFolderKeysRef.current.clear();
                        }}
                        variant="outline"
                      >
                        Deselect All
                      </Button>
                      <Button
                        isLoading={isPending}
                        onClick={() => {
                          setIsFolderSelectionOpen(false);
                        }}
                      >
                        Done
                      </Button>
                    </DrawerFooter>
                  </TabsContent>
                </Tabs>
              </DrawerContent>
            </Drawer>

            {(location?.state?.selectedVRFolders?.length > 0 ||
              location?.state?.selectedVRFiles?.length > 0) && (
              <div className="py-4 pt-8">
                <h2 className="text-base font-medium">
                  Selected Knowledge Files:
                </h2>
                {location?.state?.selectedVRFolders?.length > 0 && (
                  <ul className="mt-2">
                    {location.state.selectedVRFolders.map((file) => (
                      <li
                        className="relative flex items-center gap-2 px-3 py-1.5"
                        key={file.path}
                      >
                        <DirectoryTypeIcon />
                        <span className="text-gray-80 text-sm">
                          {file.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {location?.state?.selectedVRFiles?.length > 0 && (
                  <ul className="mt-2">
                    {location.state.selectedVRFiles.map((file) => (
                      <li
                        className="relative flex items-center gap-2 px-3 py-1.5"
                        key={file.path}
                      >
                        <FileTypeIcon />
                        <span className="text-gray-80 text-sm">
                          {file.name}
                        </span>
                        <Badge className="text-gray-80 ml-2 bg-gray-400 text-xs uppercase">
                          {file?.vr_header?.resource_source?.Reference?.FileRef
                            ?.file_type?.Document ?? '-'}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </ScrollArea>

          <Button
            className="w-full"
            data-testid="create-job-submit-button"
            disabled={isPending}
            isLoading={isPending}
            type="submit"
          >
            <FormattedMessage id="create-job" />
          </Button>
        </form>
      </Form>
    </div>
  );
};
