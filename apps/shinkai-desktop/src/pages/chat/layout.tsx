import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { SmartInbox } from '@shinkai_network/shinkai-message-ts/models';
import {
  getMessageContent,
  isJobInbox,
  isLocalMessage,
} from '@shinkai_network/shinkai-message-ts/utils';
import {
  UpdateInboxNameFormSchema,
  updateInboxNameFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/inbox';
import { useArchiveJob } from '@shinkai_network/shinkai-node-state/lib/mutations/archiveJob/useArchiveJob';
import { useUpdateInboxName } from '@shinkai_network/shinkai-node-state/lib/mutations/updateInboxName/useUpdateInboxName';
import { useGetInboxes } from '@shinkai_network/shinkai-node-state/lib/queries/getInboxes/useGetInboxes';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
  ScrollArea,
  Separator,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  ActiveIcon,
  ArchiveIcon,
  ChatBubbleIcon,
  CreateAIIcon,
  JobBubbleIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Edit3 } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Outlet, useMatch, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { handleSendNotification } from '../../lib/notifications';
import { useAuth } from '../../store/auth';

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
      sender: auth.shinkai_identity,
      senderSubidentity: auth.profile,
      receiver: `${auth.shinkai_identity}`,
      my_device_encryption_sk: auth.my_device_encryption_sk,
      my_device_identity_sk: auth.my_device_identity_sk,
      node_encryption_pk: auth.node_encryption_pk,
      profile_encryption_sk: auth.profile_encryption_sk,
      profile_identity_sk: auth.profile_identity_sk,
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

const MessageButton = ({
  to,
  isArchivedMessage,
  inbox,
}: {
  to: string;
  isArchivedMessage?: boolean;
  inbox: SmartInbox;
}) => {
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();
  const inboxId = inbox.inbox_id;
  const inboxName =
    inbox.last_message && inbox.custom_name === inbox.inbox_id
      ? getMessageContent(inbox.last_message)?.slice(0, 40)
      : inbox.custom_name?.slice(0, 40);

  const lastMessageTime =
    inbox.last_message?.external_metadata?.scheduled_time ?? '';
  const isJobLastMessage = inbox.last_message
    ? !isLocalMessage(
        inbox.last_message,
        auth?.shinkai_identity ?? '',
        auth?.profile ?? '',
      )
    : false;

  const match = useMatch(to);
  const previousDataRef = useRef<string>(lastMessageTime);
  const previousLastMessageTime = previousDataRef.current;

  useEffect(() => {
    if (
      lastMessageTime !== previousLastMessageTime &&
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
    lastMessageTime,
    isJobLastMessage,
    inboxId,
    previousLastMessageTime,
    inboxName,
  ]);

  const [isEditable, setIsEditable] = useState(false);

  const { mutateAsync: archiveJob } = useArchiveJob({
    onSuccess: () => {
      toast.success(t('chat.archives.success'));
    },
    onError: (error) => {
      toast.error(t('chat.archives.error'), {
        description: error.message,
      });
    },
  });

  const handleArchiveJob = async (
    event: React.MouseEvent,
    inbox: SmartInbox,
  ) => {
    event.preventDefault();
    await archiveJob({
      nodeAddress: auth?.node_address ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      profile: auth?.profile ?? '',
      inboxId: inbox.inbox_id,
      my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
      my_device_identity_sk: auth?.my_device_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    });
  };

  return isEditable ? (
    <InboxNameInput
      closeEditable={() => setIsEditable(false)}
      inboxId={inboxId}
      inboxName={inboxName}
    />
  ) : (
    <Link
      className={cn(
        'text-gray-80 group flex h-[46px] w-full items-center gap-2 rounded-lg px-2 py-2 hover:bg-gray-300',
        match && 'bg-gray-300 text-white',
      )}
      key={inboxId}
      to={to}
    >
      {isJobInbox(inboxId) ? (
        <JobBubbleIcon className="mr-2 h-4 w-4 shrink-0" />
      ) : (
        <ChatBubbleIcon className="mr-2 h-4 w-4 shrink-0" />
      )}
      <span className="line-clamp-1 flex-1 break-all text-left text-xs">
        {inboxName}
      </span>
      <div className="translate-x-full transition duration-200 group-hover:translate-x-0">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className={cn('justify-self-end bg-transparent')}
                onClick={() => setIsEditable(true)}
                size="icon"
                type="button"
                variant="ghost"
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
        </TooltipProvider>
        {isJobInbox(inboxId) && !isArchivedMessage && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className={cn('justify-self-end bg-transparent')}
                  onClick={(event) => handleArchiveJob(event, inbox)}
                  size={'icon'}
                  type="button"
                  variant={'ghost'}
                >
                  <ArchiveIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent>
                  <p>{t('chat.archives.archive')}</p>
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </Link>
  );
};

const ChatLayout = () => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
  const { inboxes, isPending, isSuccess } = useGetInboxes(
    {
      nodeAddress: auth?.node_address ?? '',
      sender: auth?.shinkai_identity ?? '',
      senderSubidentity: auth?.profile ?? '',
      // Assuming receiver and target_shinkai_name_profile are the same as sender
      receiver: auth?.shinkai_identity ?? '',
      targetShinkaiNameProfile: `${auth?.shinkai_identity}/${auth?.profile}`,
      my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
      my_device_identity_sk: auth?.my_device_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    },
    {
      refetchIntervalInBackground: true,
      refetchInterval: (query) => {
        const allInboxesAreCompleted = query.state.data?.every((inbox) => {
          return (
            inbox.last_message &&
            !isLocalMessage(
              inbox.last_message,
              auth?.shinkai_identity ?? '',
              auth?.profile ?? '',
            )
          );
        });
        return allInboxesAreCompleted ? 0 : 3000;
      },
    },
  );

  const activesInboxes = useMemo(() => {
    return inboxes?.filter((inbox) => !inbox.is_finished);
  }, [inboxes]);

  const archivesInboxes = useMemo(() => {
    return inboxes?.filter((inbox) => inbox.is_finished);
  }, [inboxes]);

  return (
    <div className={cn('grid h-screen w-full grid-cols-[280px_1px_1fr]')}>
      <div className="flex h-full flex-col px-2 py-4">
        <div className="mb-4 flex items-center justify-between gap-2 px-2">
          <h2>{t('chat.chats')}</h2>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="h-8 w-8"
                  onClick={() => {
                    navigate('/create-job');
                  }}
                  size="icon"
                  variant="ghost"
                >
                  <CreateAIIcon className="h-4 w-4 shrink-0" />
                  <span className="sr-only">{t('chat.create')}</span>
                </Button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent>
                  <p>{t('chat.create')}</p>
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
        </div>
        <ScrollArea>
          <Tabs defaultValue="actives">
            <TabsList className="grid w-full grid-cols-2 bg-transparent">
              <TabsTrigger
                className="flex items-center gap-1.5"
                value="actives"
              >
                <ActiveIcon className="h-4 w-4" />
                {t('chat.actives.label')}
              </TabsTrigger>
              <TabsTrigger
                className="flex items-center gap-1.5"
                value="archives"
              >
                <ArchiveIcon className="h-4 w-4" />
                {t('chat.archives.label')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="actives">
              <div className="space-y-1">
                {isPending &&
                  Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton
                      className="h-11 w-full shrink-0 rounded-md bg-gray-300"
                      key={index}
                    />
                  ))}

                {isSuccess &&
                  activesInboxes?.length > 0 &&
                  activesInboxes.map((inbox) => (
                    <MessageButton
                      inbox={inbox}
                      key={inbox.inbox_id}
                      to={`/inboxes/${encodeURIComponent(inbox.inbox_id)}`}
                    />
                  ))}
                {isSuccess && activesInboxes?.length === 0 && (
                  <p className="text-gray-80 py-3 text-center text-xs">
                    {t('chat.actives.notFound')}{' '}
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="archives">
              <div className="space-y-1">
                {isPending &&
                  Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton
                      className="h-11 w-full shrink-0 rounded-md bg-gray-300"
                      key={index}
                    />
                  ))}
                {isSuccess &&
                  archivesInboxes.length > 0 &&
                  archivesInboxes.map((inbox) => (
                    <MessageButton
                      inbox={inbox}
                      isArchivedMessage
                      key={inbox.inbox_id}
                      to={`/inboxes/${encodeURIComponent(inbox.inbox_id)}`}
                    />
                  ))}
                {isSuccess && archivesInboxes?.length === 0 && (
                  <p className="text-gray-80 py-3 text-center text-xs">
                    {t('chat.archives.notFound')}{' '}
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </div>
      <Separator orientation="vertical" />
      <Outlet />
    </div>
  );
};

export default ChatLayout;
