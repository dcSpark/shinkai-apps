import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateWorkflow } from '@shinkai_network/shinkai-node-state/lib/mutations/createWorkflow/useCreateWorkflow';
import { useRemoveWorkflow } from '@shinkai_network/shinkai-node-state/lib/mutations/removeWorkflow/useRemoveWorkflow';
import { useUpdateWorkflow } from '@shinkai_network/shinkai-node-state/lib/mutations/updateWorkflow/useUpdateWorkflow';
import { Workflow } from '@shinkai_network/shinkai-node-state/lib/queries/getWorkflowList/types';
import { useGetWorkflowList } from '@shinkai_network/shinkai-node-state/lib/queries/getWorkflowList/useGetWorkflowList';
import { useGetWorkflowSearch } from '@shinkai_network/shinkai-node-state/lib/queries/getWorkflowSearch/useGetWorkflowSearch';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Textarea,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import {
  Edit3Icon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import React, { createContext, useContext, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { createStore, useStore } from 'zustand';

import { useDebounce } from '../../../hooks/use-debounce';
import { formatWorkflowName } from '../../../pages/create-job';
import { useAuth } from '../../../store/auth';

type WorkflowSelectedStore = {
  workflowSelectionDrawerOpen: boolean;
  setWorkflowSelectionDrawerOpen: (
    workflowSelectionDrawerOpen: boolean,
  ) => void;
  workflowSelected: Workflow | undefined;
  setWorkflowSelected: (workflowSelected: Workflow | undefined) => void;
};

const createWorkflowSelectionStore = () =>
  createStore<WorkflowSelectedStore>((set) => ({
    workflowSelectionDrawerOpen: false,
    setWorkflowSelectionDrawerOpen: (workflowSelectionDrawerOpen) => {
      set({ workflowSelectionDrawerOpen });
    },

    workflowSelected: undefined,
    setWorkflowSelected: (workflowSelected) => {
      set({ workflowSelected });
    },
  }));

const WorkflowSelectedContext = createContext<ReturnType<
  typeof createWorkflowSelectionStore
> | null>(null);

const WorkflowSearchDrawer = ({
  onSelectWorkflow,
}: {
  onSelectWorkflow?: (workflow: Workflow) => void;
}) => {
  const workflowSelectionDrawerOpen = useWorkflowSelectionStore(
    (state) => state.workflowSelectionDrawerOpen,
  );
  const setWorkflowSelectionDrawerOpen = useWorkflowSelectionStore(
    (state) => state.setWorkflowSelectionDrawerOpen,
  );
  const workflowSelected = useWorkflowSelectionStore(
    (state) => state.workflowSelected,
  );
  const setWorkflowSelected = useWorkflowSelectionStore(
    (state) => state.setWorkflowSelected,
  );
  const auth = useAuth((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 600);
  const isSearchQuerySynced = searchQuery === debouncedSearchQuery;

  const [selectedWorkflowEdit, setSelectedWorkflowEdit] =
    useState<Workflow | null>(null);

  const { isPending, data: workflowList } = useGetWorkflowList({
    nodeAddress: auth?.node_address ?? '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const { data: searchWorkflowList, isPending: isSearchWorkflowListPending } =
    useGetWorkflowSearch(
      {
        nodeAddress: auth?.node_address ?? '',
        shinkaiIdentity: auth?.shinkai_identity ?? '',
        profile: auth?.profile ?? '',
        search: debouncedSearchQuery,
        my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
        my_device_identity_sk: auth?.my_device_identity_sk ?? '',
        node_encryption_pk: auth?.node_encryption_pk ?? '',
        profile_encryption_sk: auth?.profile_encryption_sk ?? '',
        profile_identity_sk: auth?.profile_identity_sk ?? '',
      },
      {
        enabled: !!isSearchQuerySynced,
      },
    );

  const { mutateAsync: removeWorkflow } = useRemoveWorkflow({
    onSuccess: () => {
      toast.success('Workflow removed successfully');
    },
    onError: (error) => {
      toast.error('Failed to remove workflow', {
        description: error.message,
      });
    },
  });

  return (
    <Sheet
      onOpenChange={setWorkflowSelectionDrawerOpen}
      open={workflowSelectionDrawerOpen}
    >
      <SheetContent side="right">
        <CreateWorkflowDrawer />
        <SheetHeader className="mb-4 p-0">
          <SheetTitle>Workflow Library</SheetTitle>
          <SheetDescription>
            <p>Choose a workflow from the library to get started.</p>
          </SheetDescription>
        </SheetHeader>
        <div className="relative mb-4 flex h-10 w-full items-center">
          <Input
            className="placeholder-gray-80 !h-full bg-transparent py-2 pl-10"
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            placeholder="Search..."
            spellCheck={false}
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
              <span className="sr-only">Clear Search</span>
            </Button>
          )}
        </div>
        <ScrollArea className="h-[calc(100vh-140px)] pr-4 [&>div>div]:!block">
          <div className="divide-y divide-gray-200 py-5">
            {(isPending ||
              !isSearchQuerySynced ||
              isSearchWorkflowListPending) &&
              Array.from({ length: 4 }).map((_, idx) => (
                <div
                  className="mb-2 flex h-[70px] items-center justify-between gap-2 rounded-lg bg-gray-300 py-3"
                  key={idx}
                />
              ))}
            {!searchQuery &&
              isSearchQuerySynced &&
              workflowList?.map((workflow) => (
                <div
                  className={cn(
                    'group relative flex min-h-[70px] w-full flex-col gap-1 rounded-sm px-3 py-2.5 pr-8 text-left text-sm hover:bg-gray-300',
                  )}
                  key={workflow.name}
                  onClick={() => {
                    setWorkflowSelected(workflow);
                    setWorkflowSelectionDrawerOpen(false);
                    onSelectWorkflow?.(workflow);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="absolute right-1 top-1 flex translate-x-[150%] items-center gap-0.5 transition duration-200 group-hover:translate-x-0">
                    <button
                      className="text-gray-80 rounded-full p-2 transition-colors hover:bg-gray-400 hover:text-white"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedWorkflowEdit(workflow);
                      }}
                      type="button"
                    >
                      <Edit3Icon className="h-4 w-4" />
                    </button>

                    <button
                      className="text-gray-80 rounded-full p-2 transition-colors hover:bg-gray-400 hover:text-white"
                      onClick={async (event) => {
                        event.stopPropagation();
                        await removeWorkflow({
                          profile: auth?.profile ?? '',
                          nodeAddress: auth?.node_address ?? '',
                          shinkaiIdentity: auth?.shinkai_identity ?? '',
                          workflowKey: `${workflow.name}:::${workflow.version}`,
                          my_device_encryption_sk:
                            auth?.profile_encryption_sk ?? '',
                          my_device_identity_sk:
                            auth?.profile_identity_sk ?? '',
                          node_encryption_pk: auth?.node_encryption_pk ?? '',
                          profile_encryption_sk:
                            auth?.profile_encryption_sk ?? '',
                          profile_identity_sk: auth?.profile_identity_sk ?? '',
                        });
                      }}
                      type="button"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm font-medium">
                    {formatWorkflowName(workflow.name)}{' '}
                    {workflowSelected?.name === workflow.name && (
                      <Badge
                        className="bg-brand ml-2 text-gray-50"
                        variant="default"
                      >
                        Selected
                      </Badge>
                    )}
                  </span>
                  <p className="text-gray-80 text-xs">{workflow.description}</p>
                </div>
              ))}
            {searchQuery &&
              isSearchQuerySynced &&
              searchWorkflowList?.map((workflow) => (
                <button
                  className={cn(
                    'flex w-full flex-col gap-1 rounded-sm px-3 py-2 text-left text-sm hover:bg-gray-300',
                  )}
                  key={workflow.Workflow.workflow.name}
                  onClick={() => {
                    setWorkflowSelected({
                      description: workflow.Workflow.workflow.description,
                      name: workflow.Workflow.workflow.name,
                      raw: workflow.Workflow.workflow.raw,
                      version: workflow.Workflow.workflow.version,
                    });
                    setWorkflowSelectionDrawerOpen(false);
                  }}
                  type="button"
                >
                  <span className="text-sm font-medium">
                    {formatWorkflowName(workflow.Workflow.workflow.name)}{' '}
                    {workflowSelected?.name ===
                      workflow.Workflow.workflow.name && (
                      <Badge
                        className="bg-brand ml-2 font-light text-gray-50 shadow-none"
                        variant="default"
                      >
                        Current
                      </Badge>
                    )}
                  </span>
                  <p className="text-gray-80 text-sm">
                    {workflow.Workflow.workflow.description}
                  </p>
                </button>
              ))}
            {searchQuery &&
              isSearchQuerySynced &&
              searchWorkflowList?.length === 0 && (
                <div className="flex h-20 items-center justify-center">
                  <p className="text-gray-80 text-sm">
                    No workflows found for the search query
                  </p>
                </div>
              )}
          </div>
        </ScrollArea>
        {selectedWorkflowEdit && (
          <UpdateWorkflowDrawer
            open={!!selectedWorkflowEdit}
            setOpen={(open) => {
              if (!open) {
                setSelectedWorkflowEdit(null);
              }
            }}
            workflowDescription={selectedWorkflowEdit.description}
            workflowRaw={selectedWorkflowEdit.raw}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};

const createWorkflowFormSchema = z.object({
  workflowRaw: z.string().min(1, 'Workflow code is required'),
  workflowDescription: z.string().min(1, 'Workflow description is required'),
});

type CreateWorkflowFormSchema = z.infer<typeof createWorkflowFormSchema>;

function CreateWorkflowDrawer() {
  const auth = useAuth((state) => state.auth);
  const createWorkflowForm = useForm<CreateWorkflowFormSchema>({
    resolver: zodResolver(createWorkflowFormSchema),
  });
  const [isWorkflowDrawerOpen, setIsWorkflowDrawerOpen] = useState(false);

  const { mutateAsync: createWorkflow, isPending } = useCreateWorkflow({
    onSuccess: () => {
      toast.success('Workflow created successfully');
      setIsWorkflowDrawerOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to create workflow', {
        description: error.message,
      });
    },
  });

  const onSubmit = async (data: CreateWorkflowFormSchema) => {
    await createWorkflow({
      nodeAddress: auth?.node_address ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      profile: auth?.profile ?? '',
      workflowRaw: data.workflowRaw,
      workflowDescription: data.workflowDescription ?? '',
      my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
      my_device_identity_sk: auth?.profile_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    });
  };
  return (
    <Dialog onOpenChange={setIsWorkflowDrawerOpen} open={isWorkflowDrawerOpen}>
      <DialogTrigger asChild>
        <button
          className="bg-brand absolute right-12 top-2 rounded-full p-2"
          type="button"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-gray-500">
        <DialogHeader>
          <DialogTitle>Create custom workflow</DialogTitle>

          <div>
            <Form {...createWorkflowForm}>
              <form
                className="mt-5 flex flex-col gap-3"
                onSubmit={createWorkflowForm.handleSubmit(onSubmit)}
              >
                <FormField
                  control={createWorkflowForm.control}
                  name="workflowRaw"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workflow Code</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Textarea
                            autoFocus={true}
                            className="!min-h-[130px] resize-none text-sm"
                            onKeyDown={(event) => {
                              if (
                                event.key === 'Enter' &&
                                (event.metaKey || event.ctrlKey)
                              ) {
                                createWorkflowForm.handleSubmit(onSubmit)();
                                return;
                              }
                            }}
                            spellCheck={false}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createWorkflowForm.control}
                  name="workflowDescription"
                  render={({ field }) => (
                    <TextField
                      autoFocus
                      field={field}
                      label="Workflow Description"
                    />
                  )}
                />
                <Button
                  className="mt-4"
                  disabled={isPending}
                  isLoading={isPending}
                  type="submit"
                >
                  Create Workflow
                </Button>
              </form>
            </Form>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
function UpdateWorkflowDrawer({
  workflowRaw,
  workflowDescription,
  open,
  setOpen,
}: {
  workflowRaw: string;
  workflowDescription: string;
  open: boolean;
  setOpen: (isOpen: boolean) => void;
}) {
  const auth = useAuth((state) => state.auth);
  const createWorkflowForm = useForm<CreateWorkflowFormSchema>({
    resolver: zodResolver(createWorkflowFormSchema),
    defaultValues: {
      workflowDescription,
      workflowRaw,
    },
  });

  const { mutateAsync: updateWorkflow, isPending } = useUpdateWorkflow({
    onSuccess: () => {
      toast.success('Workflow updated successfully');
      setOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to update workflow', {
        description: error.message,
      });
    },
  });

  const onSubmit = async (data: CreateWorkflowFormSchema) => {
    await updateWorkflow({
      nodeAddress: auth?.node_address ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      profile: auth?.profile ?? '',
      workflowRaw: data.workflowRaw,
      workflowDescription: data.workflowDescription ?? '',
      my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
      my_device_identity_sk: auth?.profile_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    });
  };
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="bg-gray-500">
        <DialogHeader>
          <DialogTitle>Update workflow</DialogTitle>
          <div>
            <Form {...createWorkflowForm}>
              <form
                className="mt-5 flex flex-col gap-3"
                onSubmit={createWorkflowForm.handleSubmit(onSubmit)}
              >
                <FormField
                  control={createWorkflowForm.control}
                  name="workflowRaw"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workflow Code</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Textarea
                            className="!min-h-[130px] resize-none text-sm"
                            onKeyDown={(event) => {
                              if (
                                event.key === 'Enter' &&
                                (event.metaKey || event.ctrlKey)
                              ) {
                                createWorkflowForm.handleSubmit(onSubmit)();
                                return;
                              }
                            }}
                            spellCheck={false}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createWorkflowForm.control}
                  name="workflowDescription"
                  render={({ field }) => (
                    <TextField
                      autoFocus
                      field={field}
                      label="Workflow Description"
                    />
                  )}
                />
                <Button
                  className="mt-4"
                  disabled={isPending}
                  isLoading={isPending}
                  type="submit"
                >
                  Update Workflow
                </Button>
              </form>
            </Form>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export const WorkflowSelectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const storeRef = useRef<ReturnType<typeof createWorkflowSelectionStore>>();
  if (!storeRef.current) {
    storeRef.current = createWorkflowSelectionStore();
  }
  return (
    <WorkflowSelectedContext.Provider value={storeRef.current}>
      {children}
      <WorkflowSearchDrawer />
    </WorkflowSelectedContext.Provider>
  );
};

export function useWorkflowSelectionStore<T>(
  selector: (state: WorkflowSelectedStore) => T,
) {
  const store = useContext(WorkflowSelectedContext);
  if (!store) {
    throw new Error('Missing WorkflowSelectionProvider');
  }
  const value = useStore(store, selector);

  return value;
}
