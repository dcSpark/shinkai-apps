import { zodResolver } from '@hookform/resolvers/zod';
import { DialogClose } from '@radix-ui/react-dialog';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
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
import { useGetInboxesWithPagination } from '@shinkai_network/shinkai-node-state/v2/queries/getInboxes/useGetInboxesWithPagination';
import {
  Button,
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
  ScrollArea,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  ChatBubbleIcon,
  CreateAIIcon,
  JobBubbleIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Edit3, Trash2Icon } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useInView } from 'react-intersection-observer';
import { Link, Outlet, useMatch, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import ArtifactPreview from '../../components/chat/artifact-preview';
import { useChatStore } from '../../components/chat/context/chat-context';
import { useSetJobScope } from '../../components/chat/context/set-job-scope-context';
import { usePromptSelectionStore } from '../../components/prompt/context/prompt-selection-context';
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

  const match = useMatch(to);
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
                'text-gray-80 group relative flex h-[46px] w-full items-center gap-2 rounded-lg px-2 py-2 hover:bg-gray-300',
                match && 'bg-gray-300 text-white',
              )}
              key={inboxId}
              onClick={() => {
                resetJobScope();
                setSelectedArtifact(null);
              }}
              to={to}
            >
              {isJobInbox(inboxId) ? (
                <JobBubbleIcon className="mr-2 h-4 w-4 shrink-0 text-inherit" />
              ) : (
                <ChatBubbleIcon className="mr-2 h-4 w-4 shrink-0 text-inherit" />
              )}
              <span className="line-clamp-1 flex-1 break-all pr-2 text-left text-xs">
                {inboxName}
              </span>
              <div className="absolute right-0 rounded-full bg-transparent opacity-0 duration-200 group-hover:bg-gray-300 group-hover:opacity-100">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className={cn('justify-self-end bg-transparent')}
                      onClick={() => setIsEditable(true)}
                      size="icon"
                      type="button"
                      variant="tertiary"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent>
                      <p>{t('common.rename')}</p>
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className={cn('justify-self-end bg-transparent')}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDeleteModalOpen(true);
                      }}
                      size={'icon'}
                      type="button"
                      variant={'tertiary'}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
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
      navigate('/inboxes');
    },
    onError: (error) => {
      toast.error('Failed to remove chat', {
        description: error?.response?.data?.message ?? error.message,
      });
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
            animate={{ width: 240, opacity: 1 }}
            className="flex h-full shrink-0 flex-col overflow-hidden border-r border-gray-300"
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

const ChatSidebar = () => {
  const navigate = useNavigate();
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();

  const resetJobScope = useSetJobScope((state) => state.resetJobScope);
  const setSelectedArtifact = useChatStore(
    (state) => state.setSelectedArtifact,
  );
  const setPromptSelected = usePromptSelectionStore(
    (state) => state.setPromptSelected,
  );

  const { ref, inView } = useInView();

  const {
    data: inboxesPagination,
    isPending,
    isSuccess,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetInboxesWithPagination(
    { nodeAddress: auth?.node_address ?? '', token: auth?.api_v2_key ?? '' },
    // {
    //   refetchIntervalInBackground: true,
    //   refetchInterval: (query) => {
    //     const queryState = query?.state?.data?.filter(
    //       (item) => !!item.last_message,
    //     );
    //     if (!queryState || !auth) return 0;

    //     const allInboxesAreCompleted = queryState.every((inbox) => {
    //       return (
    //         inbox.last_message &&
    //         inbox.last_message.sender &&
    //         !(
    //           inbox.last_message.sender === auth?.shinkai_identity &&
    //           inbox.last_message.sender_subidentity === auth?.profile
    //         )
    //       );
    //     });

    //     return allInboxesAreCompleted ? 0 : 5000;
    //   },
    // },
  );

  console.log(inboxesPagination, 'inboxes');

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const hasInboxes =
    (inboxesPagination?.pages?.at(-1)?.inboxes ?? []).length > 0;

  return (
    <div className="flex h-full w-[240px] flex-col px-3 py-4 pt-6">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2>{t('chat.chats')}</h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-8 w-8"
              onClick={() => {
                resetJobScope();
                setPromptSelected(undefined);
                setSelectedArtifact(null);

                const element = document.querySelector(
                  '#chat-input',
                ) as HTMLDivElement;
                if (element) {
                  element?.focus?.();
                }

                navigate('/inboxes');
              }}
              size="icon"
              variant="tertiary"
            >
              <CreateAIIcon className="text-gray-80 h-[18px] w-[18px]" />
              <span className="sr-only">{t('chat.create')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent
              align="center"
              className="flex flex-col items-center gap-1"
              side="bottom"
            >
              <span>{t('chat.create')}</span>
              <div className="text-gray-80 flex items-center justify-center gap-2 text-center">
                <span>⌘</span>
                <span>N</span>
              </div>
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </div>
      <ScrollArea>
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
                          inbox.last_message.sender ===
                            auth?.shinkai_identity &&
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
      </ScrollArea>
    </div>
  );
};

export default ChatLayout;
