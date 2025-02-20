import { zodResolver } from '@hookform/resolvers/zod';
import { Prompt } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { useCreatePrompt } from '@shinkai_network/shinkai-node-state/v2/mutations/createPrompt/useCreatePrompt';
import { useRemovePrompt } from '@shinkai_network/shinkai-node-state/v2/mutations/removePrompt/useRemovePrompt';
import { useUpdatePrompt } from '@shinkai_network/shinkai-node-state/v2/mutations/updatePrompt/useUpdatePrompt';
// import { useUpdatePrompt } from '@shinkai_network/shinkai-node-state/v2/mutations/updatePrompt/useUpdatePrompt';
import { useGetPromptList } from '@shinkai_network/shinkai-node-state/v2/queries/getPromptList/useGetPromptList';
import { useGetPromptSearch } from '@shinkai_network/shinkai-node-state/v2/queries/getPromptSearch/useGetPromptSearch';
import {
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
  // Edit3Icon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import React, { createContext, useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { createStore, useStore } from 'zustand';

import { useDebounce } from '../../../hooks/use-debounce';
import { useAuth } from '../../../store/auth';

type PromptSelectedStore = {
  promptSelectionDrawerOpen: boolean;
  setPromptSelectionDrawerOpen: (promptSelectionDrawerOpen: boolean) => void;
  promptSelected: Prompt | undefined;
  setPromptSelected: (promptSelected: Prompt | undefined) => void;
  selectedPromptEdit: Prompt | undefined;
  setSelectedPromptEdit: (selectedPromptEdit: Prompt | undefined) => void;
};

const createPromptSelectionStore = () =>
  createStore<PromptSelectedStore>((set) => ({
    promptSelectionDrawerOpen: false,
    setPromptSelectionDrawerOpen: (promptSelectionDrawerOpen) => {
      set({ promptSelectionDrawerOpen });
    },

    promptSelected: undefined,
    setPromptSelected: (promptSelected) => {
      set({ promptSelected });
    },

    selectedPromptEdit: undefined,
    setSelectedPromptEdit: (selectedPromptEdit) => {
      set({ selectedPromptEdit });
    },
  }));

const PromptSelectedContext = createContext<ReturnType<
  typeof createPromptSelectionStore
> | null>(null);

const PromptSearchDrawer = () => {
  const promptSelectionDrawerOpen = usePromptSelectionStore(
    (state) => state.promptSelectionDrawerOpen,
  );
  const setPromptSelectionDrawerOpen = usePromptSelectionStore(
    (state) => state.setPromptSelectionDrawerOpen,
  );

  const setPromptSelected = usePromptSelectionStore(
    (state) => state.setPromptSelected,
  );
  const selectedPromptEdit = usePromptSelectionStore(
    (state) => state.selectedPromptEdit,
  );
  const setSelectedPromptEdit = usePromptSelectionStore(
    (state) => state.setSelectedPromptEdit,
  );
  const auth = useAuth((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 600);
  const isSearchQuerySynced = searchQuery === debouncedSearchQuery;

  const { isPending, data: promptList } = useGetPromptList({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const { data: searchPromptList, isPending: isSearchPromptListPending } =
    useGetPromptSearch(
      {
        nodeAddress: auth?.node_address ?? '',
        token: auth?.api_v2_key ?? '',
        search: debouncedSearchQuery,
      },
      { enabled: isSearchQuerySynced },
    );

  const { mutateAsync: removePrompt } = useRemovePrompt({
    onSuccess: () => {
      toast.success('Prompt removed successfully');
    },
    onError: (error) => {
      toast.error('Failed to remove prompt', {
        description: error?.response?.data?.error ?? error.message,
      });
    },
  });

  return (
    <Sheet
      onOpenChange={setPromptSelectionDrawerOpen}
      open={promptSelectionDrawerOpen}
    >
      <SheetContent side="right">
        <CreatePromptDrawer />
        <SheetHeader className="mb-4 p-0">
          <SheetTitle>Prompt Library</SheetTitle>
          <SheetDescription>
            <p>Choose a prompt from the library to get started.</p>
          </SheetDescription>
        </SheetHeader>
        <div className="relative mb-4 flex h-10 w-full items-center">
          <Input
            autoFocus
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
            {(isPending || !isSearchQuerySynced || isSearchPromptListPending) &&
              Array.from({ length: 4 }).map((_, idx) => (
                <div
                  className="mb-2 flex h-[40px] items-center justify-between gap-2 rounded-lg bg-gray-300 py-3"
                  key={idx}
                />
              ))}
            {!searchQuery &&
              isSearchQuerySynced &&
              promptList?.map((prompt) => (
                <div
                  className={cn(
                    'group relative flex min-h-[40px] w-full flex-col gap-1 rounded-sm px-3 py-2.5 pr-8 text-left text-sm hover:bg-gray-300',
                  )}
                  key={prompt.name}
                  onClick={() => {
                    setPromptSelected(prompt);
                    setPromptSelectionDrawerOpen(false);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="absolute right-1 top-1 flex translate-x-[150%] items-center gap-0.5 transition duration-200 group-hover:translate-x-0">
                    <button
                      className="text-gray-80 rounded-full p-2 transition-colors hover:bg-gray-400 hover:text-white"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedPromptEdit(prompt);
                      }}
                      type="button"
                    >
                      <Edit3Icon className="h-4 w-4" />
                    </button>

                    <button
                      className="text-gray-80 rounded-full p-2 transition-colors hover:bg-gray-400 hover:text-white"
                      onClick={async (event) => {
                        event.stopPropagation();
                        await removePrompt({
                          nodeAddress: auth?.node_address ?? '',
                          token: auth?.api_v2_key ?? '',
                          promptName: prompt.name,
                        });
                      }}
                      type="button"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm">{prompt.name} </span>
                </div>
              ))}
            {searchQuery &&
              isSearchQuerySynced &&
              searchPromptList?.map((prompt) => (
                <div
                  className={cn(
                    'group relative flex min-h-[40px] w-full flex-col gap-1 rounded-sm px-3 py-2.5 pr-8 text-left text-sm hover:bg-gray-300',
                  )}
                  key={prompt.name}
                  onClick={() => {
                    setPromptSelected(prompt);
                    setPromptSelectionDrawerOpen(false);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="absolute right-1 top-1 flex translate-x-[150%] items-center gap-0.5 transition duration-200 group-hover:translate-x-0">
                    <button
                      className="text-gray-80 rounded-full p-2 transition-colors hover:bg-gray-400 hover:text-white"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedPromptEdit(prompt);
                      }}
                      type="button"
                    >
                      <Edit3Icon className="h-4 w-4" />
                    </button>

                    <button
                      className="text-gray-80 rounded-full p-2 transition-colors hover:bg-gray-400 hover:text-white"
                      onClick={async (event) => {
                        event.stopPropagation();
                        await removePrompt({
                          nodeAddress: auth?.node_address ?? '',
                          token: auth?.api_v2_key ?? '',
                          promptName: prompt.name,
                        });
                      }}
                      type="button"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm">{prompt.name} </span>
                </div>
              ))}
            {searchQuery &&
              isSearchQuerySynced &&
              searchPromptList?.length === 0 && (
                <div className="flex h-20 items-center justify-center">
                  <p className="text-gray-80 text-sm">
                    No prompts found for the search query
                  </p>
                </div>
              )}
          </div>
        </ScrollArea>
        {selectedPromptEdit && (
          <UpdatePromptDrawer
            isPromptEnabled={selectedPromptEdit.is_enabled}
            isPromptFavorite={selectedPromptEdit.is_favorite}
            isPromptSystem={selectedPromptEdit.is_system}
            open={!!selectedPromptEdit}
            promptContent={selectedPromptEdit.prompt}
            promptId={selectedPromptEdit.rowid}
            promptName={selectedPromptEdit.name}
            promptVersion={selectedPromptEdit.version}
            setOpen={(open) => {
              if (!open) {
                setSelectedPromptEdit(undefined);
              }
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};

const createPromptFormSchema = z.object({
  promptName: z.string().min(1, 'Prompt name is required'),
  promptContent: z.string().min(1, 'Prompt content is required'),
  isPromptFavorite: z.boolean().optional(),
  isPromptEnabled: z.boolean().optional(),
  isPromptSystem: z.boolean().optional(),
  promptVersion: z.string().optional(),
});

type CreatePromptFormSchema = z.infer<typeof createPromptFormSchema>;

export function CreatePromptDrawer({
  children,
  onPromptCreated,
}: {
  children?: React.ReactNode;
  onPromptCreated?: (prompt: Prompt) => void;
}) {
  const auth = useAuth((state) => state.auth);
  const createPromptForm = useForm<CreatePromptFormSchema>({
    resolver: zodResolver(createPromptFormSchema),
  });
  const [isPromptDrawerOpen, setIsPromptDrawerOpen] = useState(false);

  const { mutateAsync: createPrompt, isPending } = useCreatePrompt({
    onSuccess: (data) => {
      toast.success('Prompt created successfully');
      setIsPromptDrawerOpen(false);
      createPromptForm.reset({
        promptContent: '',
        promptName: '',
      });
      onPromptCreated?.(data);
    },
    onError: (error) => {
      toast.error('Failed to create prompt', {
        description: error.response?.data?.message ?? error.message,
      });
    },
  });

  const onSubmit = async (data: CreatePromptFormSchema) => {
    await createPrompt({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      promptName: data.promptName,
      promptContent: data.promptContent,
    });
  };
  return (
    <Dialog onOpenChange={setIsPromptDrawerOpen} open={isPromptDrawerOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <button
            className="bg-brand absolute right-12 top-2 rounded-full p-2"
            type="button"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create custom prompt</DialogTitle>
          <div>
            <Form {...createPromptForm}>
              <form
                className="mt-5 flex flex-col gap-3"
                onSubmit={createPromptForm.handleSubmit(onSubmit)}
              >
                <FormField
                  control={createPromptForm.control}
                  name="promptName"
                  render={({ field }) => (
                    <TextField autoFocus field={field} label="Prompt Name" />
                  )}
                />
                <FormField
                  control={createPromptForm.control}
                  name="promptContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt Content</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Textarea
                            autoFocus={true}
                            className="!min-h-[340px] resize-none text-sm"
                            onKeyDown={(event) => {
                              if (
                                event.key === 'Enter' &&
                                (event.metaKey || event.ctrlKey)
                              ) {
                                createPromptForm.handleSubmit(onSubmit)();
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
                <div className="mt-4 flex justify-end gap-3">
                  <Button
                    onClick={() => setIsPromptDrawerOpen(false)}
                    rounded="lg"
                    size="xs"
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={isPending}
                    isLoading={isPending}
                    rounded="lg"
                    size="xs"
                    type="submit"
                  >
                    Create Prompt
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function UpdatePromptDrawer({
  promptId,
  promptName,
  promptContent,
  isPromptFavorite,
  isPromptEnabled,
  isPromptSystem,
  promptVersion,
  open,
  setOpen,
}: {
  promptId: number;
  promptName: string;
  promptContent: string;
  isPromptFavorite: boolean;
  isPromptEnabled: boolean;
  isPromptSystem: boolean;
  promptVersion: string;
  open: boolean;
  setOpen: (isOpen: boolean) => void;
}) {
  const auth = useAuth((state) => state.auth);
  const createPromptForm = useForm<CreatePromptFormSchema>({
    resolver: zodResolver(createPromptFormSchema),
    defaultValues: {
      promptContent: promptContent,
      promptName: promptName,
      isPromptFavorite: isPromptFavorite,
      isPromptEnabled: isPromptEnabled,
      isPromptSystem: isPromptSystem,
      promptVersion: promptVersion,
    },
  });

  const { mutateAsync: updatePrompt, isPending } = useUpdatePrompt({
    onSuccess: () => {
      toast.success('Prompt updated successfully');
      setOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to update prompt', {
        description: error.message,
      });
    },
  });

  const onSubmit = async (data: CreatePromptFormSchema) => {
    await updatePrompt({
      id: promptId,
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      promptName: data.promptName,
      promptContent: data.promptContent,
      isPromptFavorite: data.isPromptFavorite ?? false,
      isPromptEnabled: data.isPromptEnabled ?? false,
      isPromptSystem: data.isPromptSystem ?? false,
      promptVersion: data.promptVersion ?? '1',
    });
  };
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update Prompt</DialogTitle>
          <div>
            <Form {...createPromptForm}>
              <form
                className="mt-5 flex flex-col gap-3"
                onSubmit={createPromptForm.handleSubmit(onSubmit)}
              >
                <FormField
                  control={createPromptForm.control}
                  name="promptName"
                  render={({ field }) => (
                    <TextField autoFocus field={field} label="Prompt Name" />
                  )}
                />
                <FormField
                  control={createPromptForm.control}
                  name="promptContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt Content</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Textarea
                            className="!min-h-[340px] resize-none text-sm"
                            onKeyDown={(event) => {
                              if (
                                event.key === 'Enter' &&
                                (event.metaKey || event.ctrlKey)
                              ) {
                                createPromptForm.handleSubmit(onSubmit)();
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
                <div className="mt-4 flex justify-end gap-3">
                  <Button
                    onClick={() => setOpen(false)}
                    rounded="lg"
                    size="xs"
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={isPending}
                    isLoading={isPending}
                    rounded="lg"
                    size="xs"
                    type="submit"
                  >
                    Update Prompt
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export const PromptSelectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [store] = useState<ReturnType<typeof createPromptSelectionStore>>(
    createPromptSelectionStore(),
  );

  return (
    <PromptSelectedContext.Provider value={store}>
      {children}
      <PromptSearchDrawer />
    </PromptSelectedContext.Provider>
  );
};

export function usePromptSelectionStore<T>(
  selector: (state: PromptSelectedStore) => T,
) {
  const store = useContext(PromptSelectedContext);
  if (!store) {
    throw new Error('Missing PromptSelectionProvider');
  }
  const value = useStore(store, selector);

  return value;
}
