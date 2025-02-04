import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { Prompt } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/useCreateJob';
import { useRemovePrompt } from '@shinkai_network/shinkai-node-state/v2/mutations/removePrompt/useRemovePrompt';
import { useUpdatePrompt } from '@shinkai_network/shinkai-node-state/v2/mutations/updatePrompt/useUpdatePrompt';
import { useGetChatConversationWithPagination } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/useGetChatConversationWithPagination';
import { useGetPromptList } from '@shinkai_network/shinkai-node-state/v2/queries/getPromptList/useGetPromptList';
import { useGetPromptSearch } from '@shinkai_network/shinkai-node-state/v2/queries/getPromptSearch/useGetPromptSearch';
import {
  Button,
  CopyToClipboardIcon,
  Input,
  MarkdownText,
  ScrollArea,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CirclePlayIcon,
  Edit3,
  PlusIcon,
  SearchIcon,
  StopCircleIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useWebSocketMessage } from '../components/chat/websocket-message';
import { CreatePromptDrawer } from '../components/prompt/context/prompt-selection-context';
import { useDebounce } from '../hooks/use-debounce';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';
import { useChatConversationWithOptimisticUpdates } from './chat/chat-conversation';
import { SimpleLayout } from './layout/simple-layout';

export const PromptLibrary = () => {
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 600);
  const isSearchQuerySynced = searchQuery === debouncedSearchQuery;

  const {
    data: promptList,
    isPending,
    isSuccess,
  } = useGetPromptList({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  const { data: searchPromptList, isLoading: isSearchPromptListPending } =
    useGetPromptSearch(
      {
        nodeAddress: auth?.node_address ?? '',
        token: auth?.api_v2_key ?? '',
        search: debouncedSearchQuery,
      },
      { enabled: isSearchQuerySynced },
    );

  useEffect(() => {
    if (!selectedPrompt && promptList && promptList.length > 0) {
      setSelectedPrompt(promptList[0]);
    }
    if (selectedPrompt && promptList) {
      setSelectedPrompt(
        promptList.find((prompt) => prompt.name === selectedPrompt.name) ??
          promptList[0],
      );
    }
  }, [isSuccess, promptList, selectedPrompt]);

  return (
    <SimpleLayout
      classname="max-w-[unset]"
      headerRightElement={
        <CreatePromptDrawer
          onPromptCreated={(newPrompt) => {
            setSelectedPrompt(
              promptList?.find((prompt) => prompt.name === newPrompt.name) ??
                newPrompt,
            );
          }}
        >
          <Button rounded="lg" size="xs">
            <PlusIcon className="h-5 w-5" />
            New Prompt
          </Button>
        </CreatePromptDrawer>
      }
      title={t('settings.promptLibrary.label')}
    >
      <div className="grid h-[calc(100dvh-134px)] grid-cols-[250px_1fr]">
        <ScrollArea className="h-full border-r border-gray-400 pr-4 [&>div>div]:!block">
          <div className="relative mb-4 flex h-10 w-full items-center">
            <Input
              className="placeholder-gray-80 !h-full border-none bg-gray-400 py-2 pl-10"
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
                <span className="sr-only">{t('common.clearSearch')}</span>
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-1">
            {(isPending || !isSearchQuerySynced || isSearchPromptListPending) &&
              Array.from({ length: 8 }).map((_, idx) => (
                <div
                  className={cn(
                    'text-gray-80 mb-2 flex h-10 w-full items-center gap-5 rounded-md px-2 py-2.5 text-left text-sm hover:bg-gray-300 hover:text-white',
                    'bg-gray-300 text-white',
                  )}
                  key={idx}
                />
              ))}
            {!searchQuery &&
              isSearchQuerySynced &&
              promptList?.map((prompt) => (
                <button
                  className={cn(
                    'text-gray-80 flex items-center gap-5 rounded-md px-2 py-2.5 pr-6 text-left text-sm hover:bg-gray-300 hover:text-white',
                    selectedPrompt?.name === prompt.name &&
                      'bg-gray-300 text-white',
                  )}
                  key={prompt.name}
                  onClick={() => {
                    setSelectedPrompt(prompt);
                  }}
                >
                  {prompt.name}
                </button>
              ))}
            {searchQuery &&
              isSearchQuerySynced &&
              searchPromptList?.map((prompt) => (
                <button
                  className={cn(
                    'text-gray-80 flex items-center gap-5 rounded-md px-2 py-2.5 pr-6 text-left text-sm hover:bg-gray-300',
                    selectedPrompt?.name === prompt.name &&
                      'bg-gray-300 text-white',
                  )}
                  key={prompt.name}
                  onClick={() => {
                    setSelectedPrompt(prompt);
                  }}
                >
                  {prompt.name}
                </button>
              ))}
            {searchQuery &&
              isSearchQuerySynced &&
              searchPromptList?.length === 0 && (
                <div className="flex h-20 items-center justify-center">
                  <p className="text-gray-80 text-sm">
                    {t('tools.emptyState.search.text')}
                  </p>
                </div>
              )}
          </div>
        </ScrollArea>
        <PromptPreview
          selectedPrompt={selectedPrompt}
          setSelectedPrompt={setSelectedPrompt}
        />
      </div>
    </SimpleLayout>
  );
};

function PromptPreview({
  selectedPrompt,
  setSelectedPrompt,
}: {
  selectedPrompt: Prompt | null;
  setSelectedPrompt: (prompt: Prompt | null) => void;
}) {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [editing, setEditing] = useState(false);
  const [promptEditContent, setPromptEditContent] = useState('');

  const [isTryActive, setIsTryActive] = useState(false);

  useEffect(() => {
    setEditing(false);
    setIsTryActive(false);
    setPromptEditContent('');
  }, [selectedPrompt]);

  const { mutateAsync: removePrompt } = useRemovePrompt({
    onSuccess: () => {
      toast.success('Prompt removed successfully');
      setSelectedPrompt(null);
    },
    onError: (error) => {
      toast.error('Failed to remove prompt', {
        description: error?.response?.data?.error ?? error.message,
      });
    },
  });

  const { mutateAsync: updatePrompt, isPending } = useUpdatePrompt({
    onSuccess: () => {
      setEditing(false);
    },
    onError: (error) => {
      toast.error('Failed to update prompt', {
        description: error.message,
      });
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [selectedPrompt]);

  if (!selectedPrompt) {
    return <></>;
  }
  return (
    <ScrollArea className="flex h-full flex-col px-5 pb-4" ref={scrollRef}>
      <h2 className="mb-6 font-bold text-white">{selectedPrompt?.name}</h2>

      <div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-base text-white">Prompt</span>
            <div className="flex items-center gap-2">
              {!isTryActive && (
                <>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            'text-gray-80 flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-transparent transition-colors hover:bg-gray-300 hover:text-white [&>svg]:h-3 [&>svg]:w-3',
                          )}
                          onClick={() => {
                            setEditing(true);
                            setPromptEditContent(selectedPrompt?.prompt);
                          }}
                        >
                          <Edit3 />
                        </button>
                      </TooltipTrigger>
                      <TooltipPortal>
                        <TooltipContent>
                          <p>Edit Prompt</p>
                        </TooltipContent>
                      </TooltipPortal>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <CopyToClipboardIcon
                            className={cn(
                              'text-gray-80 h-7 w-7 border border-gray-200 bg-transparent hover:bg-gray-300 [&>svg]:h-3 [&>svg]:w-3',
                            )}
                            string={selectedPrompt?.prompt ?? ''}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipPortal>
                        <TooltipContent>
                          <p>{t('common.copy')}</p>
                        </TooltipContent>
                      </TooltipPortal>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            'text-gray-80 flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-transparent transition-colors hover:bg-gray-300 hover:text-white [&>svg]:h-3 [&>svg]:w-3',
                          )}
                          onClick={async () => {
                            await removePrompt({
                              nodeAddress: auth?.node_address ?? '',
                              token: auth?.api_v2_key ?? '',
                              promptName: selectedPrompt.name,
                            });
                          }}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipPortal>
                        <TooltipContent>
                          <p>Remove Prompt</p>
                        </TooltipContent>
                      </TooltipPortal>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}

              <button
                className="text-gray-80 flex h-7 min-w-[100px] items-center justify-center gap-1 rounded-lg border border-gray-200 bg-transparent text-xs font-medium transition-colors hover:bg-gray-300 hover:text-white"
                onClick={() => {
                  setIsTryActive(!isTryActive);
                  setPromptEditContent(selectedPrompt?.prompt);
                }}
              >
                {isTryActive ? (
                  <StopCircleIcon className="h-4 w-4" />
                ) : (
                  <CirclePlayIcon className="h-4 w-4" />
                )}
                {isTryActive ? 'Cancel' : 'Try it out'}
              </button>
            </div>
          </div>
          {editing ? (
            <PromptEditor
              isPending={isPending}
              onCancel={() => setEditing(false)}
              onSave={async () =>
                await updatePrompt({
                  id: selectedPrompt.rowid,
                  nodeAddress: auth?.node_address ?? '',
                  token: auth?.api_v2_key ?? '',
                  promptName: selectedPrompt.name,
                  promptContent: promptEditContent ?? '',
                  isPromptFavorite: selectedPrompt?.is_favorite,
                  isPromptEnabled: selectedPrompt?.is_enabled,
                  isPromptSystem: selectedPrompt?.is_system,
                  promptVersion: selectedPrompt?.version,
                })
              }
              promptEditContent={promptEditContent}
              setPromptEditContent={setPromptEditContent}
            />
          ) : isTryActive ? (
            <PromptTryOut
              promptEditContent={promptEditContent}
              setPromptEditContent={setPromptEditContent}
            />
          ) : (
            <MarkdownText
              className="prose-h1:!text-gray-80 prose-h1:!text-xs !text-gray-80"
              content={selectedPrompt?.prompt ?? ''}
            />
          )}
        </div>
      </div>
    </ScrollArea>
  );
}

export const PromptEditor = ({
  promptEditContent,
  setPromptEditContent,
  isPending,
  onSave,
  onCancel,
}: {
  promptEditContent: string;
  setPromptEditContent: (value: string) => void;
  isPending: boolean;
  onSave: () => void;
  onCancel: () => void;
}) => (
  <div>
    <Textarea
      autoFocus
      className="h-full !max-h-[60vh] !min-h-[100px] resize-none pl-2 pt-2 text-sm placeholder-transparent"
      onChange={(e) => setPromptEditContent(e.target.value)}
      onFocus={(e) => {
        e.target.setSelectionRange(
          e.target.value.length,
          e.target.value.length,
        );
        e.target.scrollTop = e.target.scrollHeight;
      }}
      spellCheck={false}
      value={promptEditContent}
    />
    <div className="flex items-center justify-end gap-4 pt-3">
      <Button
        className="min-w-[100px]"
        onClick={onCancel}
        rounded="lg"
        size="xs"
        type="button"
        variant="outline"
      >
        Cancel
      </Button>
      <Button
        className="min-w-[100px]"
        isLoading={isPending}
        onClick={onSave}
        rounded="lg"
        size="xs"
        type="button"
      >
        Save
      </Button>
    </div>
  </div>
);

export const PromptTryOut = ({
  promptEditContent,
  setPromptEditContent,
}: {
  promptEditContent: string;
  setPromptEditContent: (value: string) => void;
}) => {
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
  const [chatInboxId, setChatInboxId] = useState<string | null>(null);

  const defaultAgentId = useSettings(
    (settingsStore) => settingsStore.defaultAgentId,
  );

  const { mutateAsync: createJob } = useCreateJob({
    onSuccess: (data) => {
      setChatInboxId(buildInboxIdFromJobId(data.jobId));
    },
    onError: (error) => {
      toast.error('Failed to create job', {
        description: error.message,
      });
    },
  });

  const { data } = useChatConversationWithOptimisticUpdates({
    inboxId: chatInboxId ?? '',
  });

  useWebSocketMessage({
    enabled: !!chatInboxId,
    inboxId: chatInboxId ?? '',
  });

  const isLoadingMessage = useMemo(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    return (
      !!chatInboxId &&
      lastMessage?.role === 'assistant' &&
      lastMessage?.status.type === 'running'
    );
  }, [data?.pages, chatInboxId]);

  const handleRunPrompt = async () => {
    if (!auth) return;
    if (!defaultAgentId) {
      toast.error('Please choose your default agent', {
        action: {
          label: 'Choose',
          onClick: () => {
            navigate('/settings');
          },
        },
      });
      return;
    }
    await createJob({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
      llmProvider: defaultAgentId,
      content: promptEditContent,
      isHidden: true,
    });
  };

  return (
    <div>
      <Textarea
        autoFocus
        className="h-full !max-h-[50vh] !min-h-[100px] resize-none pl-2 pt-2 text-sm placeholder-transparent"
        onChange={(e) => setPromptEditContent(e.target.value)}
        onFocus={(e) => {
          e.target.setSelectionRange(
            e.target.value.length,
            e.target.value.length,
          );
          e.target.scrollTop = e.target.scrollHeight;
        }}
        spellCheck={false}
        value={promptEditContent}
      />
      <div className="flex items-center justify-end gap-4 pt-3">
        <Button
          className="h-7 min-w-[100px] rounded-md"
          disabled={isLoadingMessage}
          isLoading={isLoadingMessage}
          onClick={handleRunPrompt}
          size="auto"
          type="button"
        >
          Run Prompt
        </Button>
      </div>
      <AnimatePresence>
        {!isLoadingMessage && chatInboxId && (
          <motion.div
            animate={{ opacity: 1 }}
            className="mt-4 overflow-hidden rounded-md border border-gray-400"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <p className="text-gray-80 border-b border-gray-300 bg-gray-200 px-2.5 py-2 text-xs">
              Output
            </p>
            <div className="p-4">
              <MarkdownText
                className="prose-h1:!text-gray-80 prose-h1:!text-xs !text-gray-80 !text-xs"
                content={data?.pages?.at(-1)?.at(-1)?.content ?? ''}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
