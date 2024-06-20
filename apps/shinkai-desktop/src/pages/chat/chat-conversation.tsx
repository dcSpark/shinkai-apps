import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  extractErrorPropertyOrContent,
  extractJobIdFromInbox,
  extractReceiverShinkaiName,
  isJobInbox,
} from '@shinkai_network/shinkai-message-ts/utils';
import {
  ChatMessageFormSchema,
  chatMessageFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/chat-message';
import { useSendMessageToJob } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMessageToJob/useSendMessageToJob';
import { useSendMessageToInbox } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMesssageToInbox/useSendMessageToInbox';
import { useSendMessageWithFilesToInbox } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMesssageWithFilesToInbox/useSendMessageWithFilesToInbox';
import { useUpdateAgentInJob } from '@shinkai_network/shinkai-node-state/lib/mutations/updateAgentInJob/useUpdateAgentInJob';
import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import { useGetChatConversationWithPagination } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/useGetChatConversationWithPagination';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  ChatInputArea,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  MessageList,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  DirectoryTypeIcon,
  fileIconMap,
  FileTypeIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { getFileExt } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { partial } from 'filesize';
import {
  AlertCircle,
  BotIcon,
  ChevronDownIcon,
  Paperclip,
  SendIcon,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useGetCurrentInbox } from '../../hooks/use-current-inbox';
import { useAnalytics } from '../../lib/posthog-provider';
import { useAuth } from '../../store/auth';

enum ErrorCodes {
  VectorResource = 'VectorResource',
  ShinkaiBackendInferenceLimitReached = 'ShinkaiBackendInferenceLimitReached',
}

const ChatConversation = () => {
  const { captureAnalyticEvent } = useAnalytics();
  const { t } = useTranslation();
  const size = partial({ standard: 'jedec' });
  const { inboxId: encodedInboxId = '' } = useParams();
  const auth = useAuth((state) => state.auth);
  const fromPreviousMessagesRef = useRef<boolean>(false);
  const inboxId = decodeURIComponent(encodedInboxId);

  const chatForm = useForm<ChatMessageFormSchema>({
    resolver: zodResolver(chatMessageFormSchema),
    defaultValues: {
      message: '',
    },
  });

  const { getRootProps: getRootFileProps, getInputProps: getInputFileProps } =
    useDropzone({
      multiple: false,
      onDrop: (acceptedFiles) => {
        const file = acceptedFiles[0];
        chatForm.setValue('file', file, { shouldValidate: true });
      },
    });

  const { file } = chatForm.watch();

  const {
    data,
    fetchPreviousPage,
    hasPreviousPage,
    isPending: isChatConversationLoading,
    isFetchingPreviousPage,
    isSuccess: isChatConversationSuccess,
  } = useGetChatConversationWithPagination({
    nodeAddress: auth?.node_address ?? '',
    inboxId: inboxId as string,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const { mutateAsync: sendMessageToInbox } = useSendMessageToInbox();
  const { mutateAsync: sendMessageToJob } = useSendMessageToJob({
    onSuccess: () => {
      captureAnalyticEvent('AI Chat', undefined);
    },
  });
  const { mutateAsync: sendTextMessageWithFilesForInbox } =
    useSendMessageWithFilesToInbox({
      onSuccess: () => {
        captureAnalyticEvent('AI Chat with Files', {
          filesCount: 1,
        });
      },
    });

  const onSubmit = async (data: ChatMessageFormSchema) => {
    if (!auth || data.message.trim() === '') return;
    fromPreviousMessagesRef.current = false;
    if (data.file) {
      await sendTextMessageWithFilesForInbox({
        nodeAddress: auth?.node_address ?? '',
        sender: auth.shinkai_identity,
        senderSubidentity: auth.profile,
        receiver: auth.shinkai_identity,
        message: data.message,
        inboxId: inboxId,
        files: [file],
        my_device_encryption_sk: auth.my_device_encryption_sk,
        my_device_identity_sk: auth.my_device_identity_sk,
        node_encryption_pk: auth.node_encryption_pk,
        profile_encryption_sk: auth.profile_encryption_sk,
        profile_identity_sk: auth.profile_identity_sk,
      });
      chatForm.reset();
      return;
    }

    if (isJobInbox(inboxId)) {
      const jobId = extractJobIdFromInbox(inboxId);
      await sendMessageToJob({
        nodeAddress: auth.node_address,
        jobId: jobId,
        message: data.message,
        files_inbox: '',
        parent: '', // Note: we should set the parent if we want to retry or branch out
        shinkaiIdentity: auth.shinkai_identity,
        profile: auth.profile,
        my_device_encryption_sk: auth.my_device_encryption_sk,
        my_device_identity_sk: auth.my_device_identity_sk,
        node_encryption_pk: auth.node_encryption_pk,
        profile_encryption_sk: auth.profile_encryption_sk,
        profile_identity_sk: auth.profile_identity_sk,
      });
    } else {
      const sender = `${auth.shinkai_identity}/${auth.profile}/device/${auth.registration_name}`;
      const receiver = extractReceiverShinkaiName(inboxId, sender);
      await sendMessageToInbox({
        nodeAddress: auth?.node_address ?? '',
        sender: auth.shinkai_identity,
        sender_subidentity: `${auth.profile}/device/${auth.registration_name}`,
        receiver,
        message: data.message,
        inboxId: inboxId,
        my_device_encryption_sk: auth.my_device_encryption_sk,
        my_device_identity_sk: auth.my_device_identity_sk,
        node_encryption_pk: auth.node_encryption_pk,
        profile_encryption_sk: auth.profile_encryption_sk,
        profile_identity_sk: auth.profile_identity_sk,
      });
    }
    chatForm.reset();
  };

  const isLoadingMessage = useMemo(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    return isJobInbox(inboxId) && lastMessage?.isLocal;
  }, [data?.pages, inboxId]);

  useEffect(() => {
    chatForm.reset();
  }, [chatForm, inboxId]);

  const isLimitReachedErrorLastMessage = useMemo(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    if (!lastMessage) return;
    const errorCode = extractErrorPropertyOrContent(
      lastMessage.content,
      'error',
    );
    return errorCode === ErrorCodes.ShinkaiBackendInferenceLimitReached;
  }, [data?.pages]);

  return (
    <div className="flex max-h-screen flex-1 flex-col overflow-hidden pt-2">
      <ConversationHeader />
      <MessageList
        containerClassName="px-5"
        fetchPreviousPage={fetchPreviousPage}
        fromPreviousMessagesRef={fromPreviousMessagesRef}
        hasPreviousPage={hasPreviousPage}
        isFetchingPreviousPage={isFetchingPreviousPage}
        isLoading={isChatConversationLoading}
        isSuccess={isChatConversationSuccess}
        noMoreMessageLabel={t('chat.allMessagesLoaded')}
        paginatedMessages={data}
      />
      {isLimitReachedErrorLastMessage && (
        <Alert className="mx-auto w-[98%] shadow-lg" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm">
            {t('chat.limitReachedTitle')}
          </AlertTitle>
          <AlertDescription className="text-gray-80 text-xs">
            <div className="flex flex-row items-center space-x-2">
              {t('chat.limitReachedDescription')}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {!isLimitReachedErrorLastMessage && (
        <div className="flex flex-col justify-start">
          <div className="relative flex items-start gap-2 p-2 pb-3">
            <Form {...chatForm}>
              <FormField
                control={chatForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-0">
                    <FormLabel className="sr-only">
                      {t('chat.enterMessage')}
                    </FormLabel>
                    <FormControl>
                      <div className="">
                        <div className="flex items-center gap-2.5 px-1 pb-2 pt-1">
                          <AgentSelection />
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  {...getRootFileProps({
                                    className: cn(
                                      'hover:bg-gray-350 relative flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full rounded-lg p-1.5 text-white',
                                    ),
                                  })}
                                >
                                  <Paperclip className="h-full w-full" />
                                  <input
                                    {...chatForm.register('file')}
                                    {...getInputFileProps({
                                      onChange:
                                        chatForm.register('file').onChange,
                                    })}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipPortal>
                                <TooltipContent
                                  align="center"
                                  className="bg-neutral-900"
                                  side="top"
                                >
                                  {t('common.uploadFile')}
                                </TooltipContent>
                              </TooltipPortal>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <ChatInputArea
                          bottomAddons={
                            <Button
                              className="h-[40px] w-[40px] self-end rounded-xl p-3"
                              disabled={isLoadingMessage}
                              onClick={chatForm.handleSubmit(onSubmit)}
                              size="icon"
                              variant="tertiary"
                            >
                              <SendIcon className="h-full w-full" />
                              <span className="sr-only">
                                {t('chat.sendMessage')}
                              </span>
                            </Button>
                          }
                          disabled={isLoadingMessage}
                          isLoading={isLoadingMessage}
                          onChange={field.onChange}
                          onSubmit={chatForm.handleSubmit(onSubmit)}
                          topAddons={
                            file && (
                              <div className="relative mt-1 flex min-w-[180px] max-w-[220px] items-center gap-2 self-start rounded-lg border border-gray-200 px-2 py-2.5">
                                {getFileExt(file?.name) &&
                                fileIconMap[getFileExt(file?.name)] ? (
                                  <FileTypeIcon
                                    className="text-gray-80 h-7 w-7 shrink-0"
                                    type={getFileExt(file?.name)}
                                  />
                                ) : (
                                  <Paperclip className="text-gray-80 h-4 w-4 shrink-0" />
                                )}
                                <div className="space-y-1">
                                  <span className="line-clamp-1 break-all text-left text-xs">
                                    {file?.name}
                                  </span>
                                  <span className="line-clamp-1 break-all text-left text-xs text-gray-100">
                                    {size(file?.size)}
                                  </span>
                                </div>
                                <button
                                  className={cn(
                                    'absolute -right-2 -top-2 h-5 w-5 cursor-pointer rounded-full bg-gray-500 p-1 text-gray-100 hover:text-white',
                                  )}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    chatForm.setValue('file', undefined, {
                                      shouldValidate: true,
                                    });
                                  }}
                                >
                                  <X className="h-full w-full" />
                                </button>
                              </div>
                            )
                          }
                          value={field.value}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </Form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatConversation;

function AgentSelection() {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const currentInbox = useGetCurrentInbox();
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

  const { mutateAsync: updateAgentInJob } = useUpdateAgentInJob({
    onError: (error) => {
      toast.error(t('agents.errors.updateAgent'), {
        description: error.message,
      });
    },
  });
  return (
    <DropdownMenu>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger className="bg-gray-350 inline-flex cursor-pointer items-center justify-between gap-1 truncate rounded-xl px-2.5 py-1.5 text-start text-xs font-normal text-gray-50 hover:text-white [&[data-state=open]>.icon]:rotate-180">
              <BotIcon className="mr-1 h-4 w-4" />
              <span>{currentInbox?.agent?.id}</span>
              <ChevronDownIcon className="icon h-3 w-3" />
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent
              align="center"
              className="bg-neutral-900"
              side="top"
            >
              {t('agents.switch')}
            </TooltipContent>
          </TooltipPortal>
          <DropdownMenuContent
            align="start"
            className="max-h-[300px] min-w-[220px] overflow-y-auto bg-gray-300 p-1 py-2"
            side="top"
          >
            <DropdownMenuRadioGroup
              onValueChange={async (value) => {
                const jobId = extractJobIdFromInbox(
                  currentInbox?.inbox_id ?? '',
                );
                await updateAgentInJob({
                  nodeAddress: auth?.node_address ?? '',
                  shinkaiIdentity: auth?.shinkai_identity ?? '',
                  profile: auth?.profile ?? '',
                  jobId: jobId,
                  newAgentId: value,
                  my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
                  my_device_identity_sk: auth?.profile_identity_sk ?? '',
                  node_encryption_pk: auth?.node_encryption_pk ?? '',
                  profile_encryption_sk: auth?.profile_encryption_sk ?? '',
                  profile_identity_sk: auth?.profile_identity_sk ?? '',
                });
              }}
              value={currentInbox?.agent?.id ?? ''}
            >
              {agents.map((agent) => (
                <DropdownMenuRadioItem
                  className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-2 text-white transition-colors hover:bg-gray-200 aria-checked:bg-gray-200"
                  key={agent.id}
                  value={agent.id}
                >
                  <BotIcon className="h-3.5 w-3.5" />
                  <div className="flex flex-col gap-1">
                    <span className="text-xs">{agent.id}</span>
                  </div>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </Tooltip>
      </TooltipProvider>
    </DropdownMenu>
  );
}

export const ConversationHeader = () => {
  const currentInbox = useGetCurrentInbox();
  const { t } = useTranslation();
  const hasFolders =
    (currentInbox?.job_scope?.vector_fs_folders ?? [])?.length > 0;
  const hasFiles = (currentInbox?.job_scope?.vector_fs_items ?? [])?.length > 0;

  const hasConversationContext = hasFolders || hasFiles;

  return (
    <div className="flex h-[58px] items-center justify-between border-b border-gray-400 px-4 py-2">
      <div className="inline-flex items-center">
        <span className="mr-2.5 line-clamp-1 inline text-sm font-medium capitalize text-white">
          {currentInbox?.custom_name || currentInbox?.inbox_id}
        </span>
      </div>
      {hasConversationContext && (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="flex h-auto items-center gap-4 bg-transparent px-2.5 py-1.5"
              variant="ghost"
            >
              {hasFolders && (
                <span className="text-gray-80 flex items-center gap-1 text-xs font-medium">
                  <DirectoryTypeIcon className="ml-1 h-4 w-4" />
                  {t('common.folderWithCount', {
                    count: currentInbox?.job_scope.vector_fs_folders.length,
                  })}
                </span>
              )}
              {hasFiles && (
                <span className="text-gray-80 flex items-center gap-1 truncate text-xs font-medium">
                  <FileTypeIcon className="ml-1 h-4 w-4" />
                  {t('common.fileWithCount', {
                    count: currentInbox?.job_scope.vector_fs_items.length,
                  })}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="max-w-md">
            <SheetHeader>
              <SheetTitle>{t('chat.context.title')}</SheetTitle>
              <SheetDescription className="mb-4 mt-2">
                {t('chat.context.description')}
              </SheetDescription>
              <div className="space-y-3 pt-4">
                {hasFolders && (
                  <div className="space-y-1">
                    <span className="font-medium text-white">
                      {t('common.folders')}
                    </span>
                    <ul>
                      {currentInbox?.job_scope?.vector_fs_folders?.map(
                        (folder) => (
                          <li
                            className="flex items-center gap-2 py-1.5"
                            key={folder.path}
                          >
                            <DirectoryTypeIcon />
                            <div className="text-gray-80 text-sm">
                              {folder.name}
                            </div>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
                {hasFiles && (
                  <div className="space-y-1">
                    <span className="font-medium text-white">
                      {t('common.files')}
                    </span>
                    <ul>
                      {currentInbox?.job_scope?.vector_fs_items?.map((file) => (
                        <li
                          className="flex items-center gap-2 py-1.5"
                          key={file.path}
                        >
                          <FileTypeIcon
                            type={
                              file?.source?.Standard?.FileRef?.file_type
                                ?.Document
                            }
                          />
                          <span className="text-gray-80 text-sm">
                            {file.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};
