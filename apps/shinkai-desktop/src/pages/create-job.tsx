import { zodResolver } from '@hookform/resolvers/zod';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
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
  FilesIcon,
  FileUploader,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  PaperClipIcon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { PlusIcon, SearchCode } from 'lucide-react';
import { TreeCheckboxSelectionKeys } from 'primereact/tree';
import { TreeNode } from 'primereact/treenode';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import {
  KnowledgeSearchDrawer,
  VectorFsScopeDrawer,
} from '../components/vector-fs/components/vector-fs-context-drawer';
import { allowedFileExtensions } from '../lib/constants';
import { ADD_AGENT_PATH } from '../routes/name';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';
import { SubpageLayout } from './layout/simple-layout';

function transformDataToTreeNodes(
  data: VRFolder,
  // @ts-ignore
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

const createJobSchema = z.object({
  model: z.string(),
  description: z.string(),
  files: z.array(z.any()).max(3),
});

export const FileList = ({
  files,
  className,
}: {
  files: ({ name: string; size?: number } | File)[];
  className?: string;
}) => {
  if (!files) return null;
  return (
    <div className={cn('flex w-full flex-col', className)}>
      {files?.map((file, idx) => (
        <div
          className="relative flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-3"
          key={idx}
        >
          <PaperClipIcon className="text-gray-100" />
          <span className="text-gray-80 flex-1 truncate text-sm">
            {file.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export function isImageOrPdf(file: File): boolean {
  if (!file) return false;
  return (
    file?.type.startsWith('image/') || file?.type.startsWith('application/pdf')
  );
}
const CreateJobPage = () => {
  const auth = useAuth((state) => state.auth);
  const defaulAgentId = useSettings((state) => state.defaultAgentId);
  const navigate = useNavigate();

  const [isVectorFSOpen, setIsVectorFSOpen] = React.useState(false);
  const [isKnowledgeSearchOpen, setIsKnowledgeSearchOpen] =
    React.useState(false);

  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [selectedKeys, setSelectedKeys] =
    useState<TreeCheckboxSelectionKeys | null>(null);

  const selectedFileKeysRef = useRef<Map<string, VRItem>>(new Map());
  const selectedFolderKeysRef = useRef<Map<string, VRFolder>>(new Map());

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

  useEffect(() => {
    if (isVRFilesSuccess) {
      setNodes(transformDataToTreeNodes(VRFiles));
    }
  }, [VRFiles, isVRFilesSuccess]);

  const createJobForm = useForm<z.infer<typeof createJobSchema>>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      files: [],
    },
  });

  const { agents, isSuccess } = useAgents({
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
      // TODO: job_inbox, false is hardcoded
      navigate(
        `/inboxes/${encodeURIComponent(buildInboxIdFromJobId(data.jobId))}`,
      );
    },
  });

  const onSubmit = async (data: z.infer<typeof createJobSchema>) => {
    if (!auth) return;
    await createJob({
      nodeAddress: auth?.node_address ?? '',
      shinkaiIdentity: auth.shinkai_identity,
      profile: auth.profile,
      agentId: data.model,
      content: data.description,
      files_inbox: '',
      files: data.files,
      is_hidden: false,
      my_device_encryption_sk: auth.my_device_encryption_sk,
      my_device_identity_sk: auth.my_device_identity_sk,
      node_encryption_pk: auth.node_encryption_pk,
      profile_encryption_sk: auth.profile_encryption_sk,
      profile_identity_sk: auth.profile_identity_sk,
    });
  };

  useEffect(() => {
    if (isSuccess && agents?.length && !defaulAgentId) {
      createJobForm.setValue('model', agents[0].id);
    } else {
      createJobForm.setValue('model', defaulAgentId);
    }
  }, [agents, createJobForm, defaulAgentId, isSuccess]);
  // useEffect(() => {
  //   return () => {
  //     file && URL.revokeObjectURL(file.preview);
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <SubpageLayout title="Create AI Chat">
      <Form {...createJobForm}>
        <form
          className="space-y-8"
          onSubmit={createJobForm.handleSubmit(onSubmit)}
        >
          <div className="space-y-6">
            <FormField
              control={createJobForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tell us the job you want to do</FormLabel>
                  <FormControl>
                    <Textarea
                      autoFocus={true}
                      className="resize-none"
                      onKeyDown={(event) => {
                        if (
                          event.key === 'Enter' &&
                          (event.metaKey || event.ctrlKey)
                        ) {
                          createJobForm.handleSubmit(onSubmit)();
                        }
                      }}
                      placeholder="Eg: Explain me how internet works..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createJobForm.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select your AI Agent</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your AI Agent" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {agents?.length ? (
                        agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            <span>{agent.id} </span>
                          </SelectItem>
                        ))
                      ) : (
                        <Button
                          onClick={() => {
                            navigate(ADD_AGENT_PATH);
                          }}
                          variant="ghost"
                        >
                          <PlusIcon className="mr-2" />
                          Add Agents
                        </Button>
                      )}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            {/*<FormField*/}
            {/*  control={createJobForm.control}*/}
            {/*  name="files"*/}
            {/*  render={({ field }) => (*/}
            {/*    <FormItem className="mt-3">*/}
            {/*      <FormLabel className="sr-only">*/}
            {/*        Upload a file (optional)*/}
            {/*      </FormLabel>*/}
            {/*      <FormControl>*/}
            {/*        <FileInput onChange={field.onChange} value={field.value} />*/}
            {/*      </FormControl>*/}
            {/*      <FormMessage />*/}
            {/*    </FormItem>*/}
            {/*  )}*/}
            {/*/>*/}
            <div className="my-3 rounded-md bg-gray-400 px-3 py-4">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-sm font-medium text-gray-100">
                    Set Chat Context
                  </h2>
                  <p className="text-gray-80 text-xs">
                    Add files or folders for your AI to use as context during
                    your conversation.
                  </p>
                </div>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="flex h-10 w-10 items-center justify-center gap-2 rounded-lg p-2.5 text-left hover:bg-gray-500"
                        onClick={() => setIsKnowledgeSearchOpen(true)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <SearchCode className="h-5 w-5" />
                        <p className="sr-only text-xs text-white">
                          AI Files Content Search
                        </p>
                      </Button>
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent sideOffset={0}>
                        Search AI Files Content
                      </TooltipContent>
                    </TooltipPortal>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex flex-col gap-1.5">
                <Button
                  className="flex h-[40px] items-center justify-between gap-2 rounded-lg p-2.5 text-left hover:bg-gray-500"
                  onClick={() => setIsVectorFSOpen(true)}
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
                <FormField
                  control={createJobForm.control}
                  name="files"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Upload a file</FormLabel>
                      <FormControl>
                        <FileUploader
                          accept={allowedFileExtensions.join(',')}
                          allowMultiple
                          descriptionText={allowedFileExtensions?.join(' | ')}
                          onChange={(acceptedFiles) => {
                            field.onChange(acceptedFiles);
                          }}
                          shouldDisableScrolling
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          <Button
            className="w-full"
            disabled={isPending}
            isLoading={isPending}
            type="submit"
          >
            Create AI Chat
          </Button>
        </form>
      </Form>
      <VectorFsScopeDrawer
        isVectorFSOpen={isVectorFSOpen}
        nodes={nodes}
        onSelectedKeysChange={setSelectedKeys}
        onVectorFSOpenChanges={setIsVectorFSOpen}
        selectedFileKeysRef={selectedFileKeysRef}
        selectedFolderKeysRef={selectedFolderKeysRef}
        selectedKeys={selectedKeys}
      />
      <KnowledgeSearchDrawer
        isKnowledgeSearchOpen={isKnowledgeSearchOpen}
        onSelectedKeysChange={setSelectedKeys}
        selectedFileKeysRef={selectedFileKeysRef}
        selectedKeys={selectedKeys}
        setIsKnowledgeSearchOpen={setIsKnowledgeSearchOpen}
      />
    </SubpageLayout>
  );
};
export default CreateJobPage;
