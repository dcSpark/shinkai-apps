import { zodResolver } from '@hookform/resolvers/zod';
import { DialogClose } from '@radix-ui/react-dialog';
import { t, useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  extractJobIdFromInbox,
  isJobInbox,
} from '@shinkai_network/shinkai-message-ts/utils';
import {
  UpdateInboxNameFormSchema,
  updateInboxNameFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/inbox';
import { useRemoveJob } from '@shinkai_network/shinkai-node-state/v2/mutations/removeJob/useRemoveJob';
import { useUpdateInboxName } from '@shinkai_network/shinkai-node-state/v2/mutations/updateInboxName/useUpdateInboxName';
import { useGetAgent } from '@shinkai_network/shinkai-node-state/v2/queries/getAgent/useGetAgent';
import { useGetAgents } from '@shinkai_network/shinkai-node-state/v2/queries/getAgents/useGetAgents';
import { useGetAgentInboxes } from '@shinkai_network/shinkai-node-state/v2/queries/getInboxes/useGetAgentInboxes';
import { useGetInboxesWithPagination } from '@shinkai_network/shinkai-node-state/v2/queries/getInboxes/useGetInboxesWithPagination';
import {
  Button,
  buttonVariants,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  AIAgentIcon,
  ScheduledTasksIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { formatDateToLocaleStringWithTime } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  EllipsisIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useInView } from 'react-intersection-observer';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';

import ArtifactPreview from '../../components/chat/artifact-preview';
import { useChatStore } from '../../components/chat/context/chat-context';
import { useSetJobScope } from '../../components/chat/context/set-job-scope-context';
import { useURLQueryParams } from '../../hooks/use-url-query-params';
import { handleSendNotification } from '../../lib/notifications';
import { useAuth } from '../../store/auth';
import { useSettings } from '../../store/settings';

const InboxNameInput = ({
  closeEditable,
  inboxId,
  inboxName,
}: {
  closeEditable: () => void;
  inboxId: string;
  inboxName: string;
}) => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const updateInboxNameForm = useForm<UpdateInboxNameFormSchema>({
    resolver: zodResolver(updateInboxNameFormSchema),
  });
  const { name: inboxNameValue } = updateInboxNameForm.watch();
  const { mutateAsync: updateInboxName } = useUpdateInboxName();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current?.focus();
    }
  }, []);

  const onSubmit = async (data: UpdateInboxNameFormSchema) => {
    if (!auth) return;

    await updateInboxName({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
      inboxId,
      inboxName: data.name,
    });
    closeEditable();
  };

  return (
    <Form {...updateInboxNameForm}>
      <form
        className="relative flex items-center"
        onSubmit={updateInboxNameForm.handleSubmit(onSubmit)}
      >
        <div className="w-full">
          <FormField
            control={updateInboxNameForm.control}
            name="name"
            render={({ field }) => (
              <div className="flex h-[46px] items-center rounded-lg bg-gray-300">
                <Edit3 className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-white" />

                <FormItem className="space-y-0 pl-7 text-xs">
                  <FormLabel className="sr-only static">
                    {t('inboxes.updateName')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-full border-none bg-transparent py-2 pr-16 text-xs caret-white placeholder:text-gray-100 focus-visible:ring-0 focus-visible:ring-white"
                      placeholder={inboxName}
                      {...field}
                      ref={inputRef}
                    />
                  </FormControl>
                </FormItem>
              </div>
            )}
          />
        </div>

        {inboxNameValue ? (
          <Button
            className="absolute right-1 top-1/2 h-8 -translate-y-1/2 transform text-xs text-white"
            size="sm"
            type="submit"
            variant="default"
          >
            {t('common.save')}
          </Button>
        ) : (
          <Button
            className="absolute right-1 top-1/2 h-8 -translate-y-1/2 transform bg-gray-700 text-xs text-white"
            onClick={closeEditable}
            size="sm"
            variant="ghost"
          >
            {t('common.cancel')}
          </Button>
        )}
      </form>
    </Form>
  );
};

const InboxMessageButtonBase = ({
  to,
  inboxId,
  inboxName,
  lastMessageTimestamp,
  isJobLastMessage,
}: {
  to: string;
  inboxId: string;
  inboxName: string;
  lastMessageTimestamp: string;
  isJobLastMessage: boolean;
}) => {
  const { t } = useTranslation();
  const resetJobScope = useSetJobScope((state) => state.resetJobScope);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const setSelectedArtifact = useChatStore(
    (state) => state.setSelectedArtifact,
  );
  const jobId = extractJobIdFromInbox(inboxId);

  const location = useLocation();
  const previousDataRef = useRef<string>(lastMessageTimestamp);
  const previousLastMessageTime = previousDataRef.current;

  useEffect(() => {
    if (
      lastMessageTimestamp !== previousLastMessageTime &&
      isJobInbox(inboxId) &&
      isJobLastMessage
    ) {
      handleSendNotification(
        t('notifications.messageReceived.label'),
        t('notifications.messageReceived.description', {
          inboxName: inboxName,
        }),
      );
    }
  }, [
    lastMessageTimestamp,
    isJobLastMessage,
    inboxId,
    previousLastMessageTime,
    inboxName,
  ]);

  const [isEditable, setIsEditable] = useState(false);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          {isEditable ? (
            <InboxNameInput
              closeEditable={() => setIsEditable(false)}
              inboxId={inboxId}
              inboxName={inboxName}
            />
          ) : (
            <Link
              className={cn(
                'text-official-gray-300 group relative flex h-[46px] w-full items-center gap-2 rounded-xl px-2 py-2 text-xs hover:bg-white/10 hover:text-white',
                location.pathname === to && 'bg-white/10 text-white',
              )}
              key={inboxId}
              onClick={() => {
                resetJobScope();
                setSelectedArtifact(null);
              }}
              to={to}
            >
              <span className="line-clamp-1 flex-1 break-all pr-2 text-left text-xs">
                {inboxName}
              </span>
              <div className="absolute right-0 rounded-full bg-transparent opacity-0 duration-200 group-hover:bg-gray-300 group-hover:opacity-100">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        buttonVariants({ variant: 'tertiary', size: 'icon' }),
                        'justify-self-end bg-transparent',
                      )}
                      onClick={() => setIsEditable(true)}
                      role="button"
                    >
                      <Edit3 className="h-4 w-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent>
                      <p>{t('common.rename')}</p>
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        buttonVariants({ variant: 'tertiary', size: 'icon' }),
                        'justify-self-end bg-transparent',
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDeleteModalOpen(true);
                      }}
                      role="button"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent>
                      <p>Delete</p>
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </div>
              <RemoveInboxMessageModal
                jobId={jobId}
                onOpenChange={setDeleteModalOpen}
                open={deleteModalOpen}
              />
            </Link>
          )}
        </div>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          align="end"
          className="max-w-[200px] bg-gray-600"
          side="right"
        >
          <p>{inboxName}</p>
        </TooltipContent>
      </TooltipPortal>
    </Tooltip>
  );
};

function RemoveInboxMessageModal({
  jobId,
  open,
  onOpenChange,
}: {
  jobId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mutateAsync: removeJob, isPending } = useRemoveJob({
    onSuccess: () => {
      onOpenChange(false);
      navigate('/inboxes');
    },
    onError: (error) => {
      toast.error('Failed to remove chat', {
        description: error?.response?.data?.message ?? error.message,
      });
      onOpenChange(false);
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="pb-0">
          {t('chat.actions.deleteInboxConfirmationTitle')}
        </DialogTitle>
        <DialogDescription>
          {t('chat.actions.deleteInboxConfirmationDescription')}
        </DialogDescription>

        <DialogFooter>
          <div className="flex gap-2 pt-4">
            <DialogClose asChild className="flex-1">
              <Button
                className="min-w-[100px] flex-1"
                size="sm"
                type="button"
                variant="ghost"
              >
                {t('common.cancel')}
              </Button>
            </DialogClose>
            <Button
              className="min-w-[100px] flex-1"
              disabled={isPending}
              isLoading={isPending}
              onClick={async () => {
                await removeJob({
                  jobId,
                  nodeAddress: auth?.node_address ?? '',
                  token: auth?.api_v2_key ?? '',
                });
              }}
              size="sm"
            >
              {t('common.delete')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const InboxMessageButton = memo(InboxMessageButtonBase);

const ChatLayout = () => {
  const isChatSidebarCollapsed = useSettings(
    (state) => state.isChatSidebarCollapsed,
  );

  const selectedArtifact = useChatStore((state) => state.selectedArtifact);
  const showArtifactPanel = selectedArtifact != null;

  return (
    <div className={cn('flex h-screen')}>
      <AnimatePresence initial={false}>
        {!isChatSidebarCollapsed && (
          <motion.div
            animate={{ width: 260, opacity: 1 }}
            className="border-official-gray-780 flex h-full shrink-0 flex-col overflow-hidden border-r"
            exit={{ width: 0, opacity: 0 }}
            initial={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChatSidebar />
          </motion.div>
        )}
      </AnimatePresence>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel className="flex h-full flex-col">
          <Outlet />
        </ResizablePanel>
        {showArtifactPanel && <ResizableHandle className="bg-gray-300" />}
        {showArtifactPanel && (
          <ResizablePanel
            collapsible
            defaultSize={42}
            maxSize={70}
            minSize={40}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {showArtifactPanel && (
                <motion.div
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  className="h-full"
                  initial={{ opacity: 0, filter: 'blur(5px)' }}
                  transition={{ duration: 0.2 }}
                >
                  <ArtifactPreview />
                </motion.div>
              )}
            </AnimatePresence>
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

const ChatList = () => {
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();

  const { ref, inView } = useInView();

  const {
    data: inboxesPagination,
    isPending,
    isSuccess,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetInboxesWithPagination({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const hasInboxes =
    (inboxesPagination?.pages?.at(-1)?.inboxes ?? []).length > 0;
  return (
    <div className="">
      <div className="mb-1 flex h-8 items-center justify-between gap-2 pl-3">
        <h2 className="font-clash text-base font-medium tracking-wide">
          {t('chat.chats')}
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="text-official-gray-300 flex size-8 items-center justify-center rounded-full hover:text-white"
              onClick={() => {
                navigate(`/home`);
              }}
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>
              <p>New Chat</p>
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </div>
      <div className="w-full space-y-1 bg-transparent">
        {isPending &&
          Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
              className="h-11 w-full shrink-0 rounded-md bg-gray-300"
              key={index}
            />
          ))}

        {isSuccess &&
          inboxesPagination?.pages.map((page) =>
            page.inboxes.map((inbox) => (
              <InboxMessageButton
                inboxId={inbox.inbox_id}
                inboxName={
                  inbox.last_message && inbox.custom_name === inbox.inbox_id
                    ? inbox.last_message.job_message.content?.slice(0, 40)
                    : inbox.custom_name?.slice(0, 40)
                }
                isJobLastMessage={
                  inbox.last_message
                    ? !(
                        inbox.last_message.sender === auth?.shinkai_identity &&
                        inbox.last_message.sender_subidentity === auth.profile
                      )
                    : false
                }
                key={inbox.inbox_id}
                lastMessageTimestamp={
                  inbox.last_message?.node_api_data.node_timestamp ?? ''
                }
                to={`/inboxes/${encodeURIComponent(inbox.inbox_id)}`}
              />
            )),
          )}
        {isSuccess && !hasInboxes && (
          <p className="text-gray-80 py-3 text-center text-xs">
            {t('chat.actives.notFound')}{' '}
          </p>
        )}
        {hasNextPage && (
          <button
            className="mx-auto mb-4 w-full"
            onClick={() => fetchNextPage()}
            ref={ref}
          >
            {isFetchingNextPage ? 'Loading more...' : 'Load more'}
          </button>
        )}
      </div>
    </div>
  );
};

const AgentInboxList = ({ agentId }: { agentId?: string }) => {
  const auth = useAuth((state) => state.auth);
  const { data: agentInboxes, isSuccess } = useGetAgentInboxes({
    agentId: agentId ?? '',
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    showHidden: true,
  });

  const { data: agent } = useGetAgent({
    agentId: agentId ?? '',
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className=" ">
      <div className="flex h-8 items-center justify-between gap-1">
        <h2 className="font-clash flex items-center gap-2 px-2 text-sm font-normal capitalize tracking-wide">
          <AIAgentIcon name={agent?.name ?? ''} size="xs" />
          {agent?.name}
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="text-official-gray-300 flex size-8 items-center justify-center rounded-full hover:text-white"
              onClick={() => {
                navigate(`/home`, {
                  state: { agentName: agentId },
                });
              }}
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>
              <p>New Chat</p>
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </div>
      <div className="flex flex-col gap-2 py-4">
        {isSuccess && agentInboxes.length === 0 && (
          <p className="text-official-gray-400 py-3 text-center text-xs">
            {t('chat.actives.notFound')}
          </p>
        )}
        {isSuccess &&
          agentInboxes.length > 0 &&
          agentInboxes?.map((inbox) => (
            <Link
              className={cn(
                'hover:bg-official-gray-850 flex flex-col items-start gap-2 rounded-lg p-3 py-2 text-left',
                location.pathname ===
                  `/inboxes/${encodeURIComponent(inbox.inbox_id)}` &&
                  'bg-official-gray-850',
              )}
              key={inbox.inbox_id}
              to={`/inboxes/${encodeURIComponent(inbox.inbox_id)}`}
            >
              <span className="text-official-gray-100 line-clamp-2 text-sm">
                {inbox.custom_name || inbox.inbox_id}
              </span>
              <span className="text-official-gray-500 text-xs">
                {formatDateToLocaleStringWithTime(
                  new Date(inbox.datetime_created),
                )}
              </span>
            </Link>
          ))}
      </div>
    </div>
  );
};

const AGENTS_DISPLAY_LIMIT = 8;
const AgentList = ({
  onSelectedAgentChange,
  selectedAgent,
}: {
  onSelectedAgentChange: (agentId: string | null) => void;
  selectedAgent: string | null;
}) => {
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  const {
    data: agents,
    isPending,
    isSuccess,
  } = useGetAgents({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const displayedAgents = useMemo(() => {
    if (!agents) return [];
    return showAll ? agents : agents.slice(0, AGENTS_DISPLAY_LIMIT);
  }, [agents, showAll]);

  const navigate = useNavigate();

  return (
    <div className="">
      <div className="mb-1 flex h-8 items-center justify-between gap-2 pl-3">
        <h2 className="font-clash text-base font-medium tracking-wide">
          {t('chat.agents')}
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="text-official-gray-300 flex size-8 items-center justify-center rounded-full hover:text-white"
              onClick={() => {
                navigate(`/add-agent`);
              }}
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>
              <p>New Agent</p>
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </div>
      <div className="w-full space-y-1 bg-transparent">
        {isPending &&
          Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
              className="h-11 w-full shrink-0 rounded-md bg-gray-300"
              key={index}
            />
          ))}

        {isSuccess &&
          displayedAgents.map((agent) => (
            <div
              className={cn(
                'text-official-gray-300 group flex h-[46px] w-full items-center gap-2 rounded-xl px-2 py-2 text-xs hover:bg-white/10 hover:text-white',
                selectedAgent === agent.agent_id && 'bg-white/10 text-white',
              )}
              key={agent.agent_id}
              onClick={() => onSelectedAgentChange(agent.agent_id)}
              role="button"
            >
              <AIAgentIcon name={agent.name} size="xs" />
              <span className="line-clamp-1 flex-1 break-all pr-2 text-left text-xs capitalize">
                {agent.name}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="inline-flex items-center opacity-0 group-hover:opacity-100"
                    onClick={() => {
                      navigate(`/home`, {
                        state: { agentName: agent.agent_id },
                      });
                    }}
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent>
                    <p>New Chat With Agent</p>
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
              {agent.cron_tasks?.length && agent.cron_tasks.length > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="inline-flex items-center"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/tasks`);
                      }}
                    >
                      <ScheduledTasksIcon className="mr-2 h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent>
                      <p>View scheduled tasks</p>
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              )}
              <ChevronRight className="h-4 w-4" />
            </div>
          ))}
        {isSuccess && !agents && (
          <p className="text-official-gray-400 py-3 text-center text-xs">
            {t('chat.actives.notFound')}{' '}
          </p>
        )}
        {isSuccess && agents && agents.length > AGENTS_DISPLAY_LIMIT && (
          <button
            className="text-official-gray-300 flex h-[46px] w-full items-center gap-2 rounded-xl px-2 py-2 text-xs hover:bg-white/10 hover:text-white"
            onClick={() => setShowAll(!showAll)}
            type="button"
          >
            <EllipsisIcon className="h-4 w-4" />
            {showAll ? t('common.showLess') : t('common.showMore')}
          </button>
        )}
      </div>
    </div>
  );
};

const variants = {
  initial: (direction: number) => {
    return { x: `${110 * direction}%`, opacity: 0 };
  },
  active: { x: '0%', opacity: 1 },
  exit: (direction: number) => {
    return { x: `${-110 * direction}%`, opacity: 0 };
  },
};

const ChatSidebar = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [direction, setDirection] = useState(0);

  const query = useURLQueryParams();

  useEffect(() => {
    const agentId = query.get('agentId');
    if (agentId) {
      setSelectedAgent(agentId);
    }
  }, [query]);

  const content = useMemo(() => {
    if (selectedAgent) {
      return (
        <div>
          <Button
            className="mb-2.5 cursor-pointer"
            disabled={selectedAgent === null}
            onClick={() => {
              if (selectedAgent === null) {
                return;
              }
              setDirection(-1);
              setSelectedAgent(null);
            }}
            size="icon"
            variant="tertiary"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <AgentInboxList agentId={selectedAgent} />
        </div>
      );
    }
    return (
      <>
        <AgentList
          onSelectedAgentChange={(agentId) => {
            setDirection(1);
            setSelectedAgent(agentId);
          }}
          selectedAgent={selectedAgent}
        />
        <ChatList />
      </>
    );
  }, [selectedAgent]);

  return (
    <div className="flex size-full flex-col overflow-auto px-2 py-4 pt-6">
      <AnimatePresence custom={direction} initial={false} mode="popLayout">
        <motion.div
          animate="active"
          className="flex flex-col gap-8"
          custom={direction}
          exit="exit"
          initial="initial"
          key={selectedAgent ?? 'chat-list'}
          transition={{ duration: 0.5, type: 'spring', bounce: 0 }}
          variants={variants}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default memo(ChatLayout);
