import { zodResolver } from '@hookform/resolvers/zod';
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
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { fileIconMap, FileTypeIcon } from '@shinkai_network/shinkai-ui/assets';
import { getFileExt } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { partial } from 'filesize';
import {
  AlertCircle,
  BotIcon,
  ChevronDownIcon,
  Paperclip,
  SendIcon,
  Terminal,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useGetCurrentInbox } from '../../hooks/use-current-inbox';
import { useAuth } from '../../store/auth/auth';

enum ErrorCodes {
  VectorResource = 'VectorResource',
  ShinkaiBackendInferenceLimitReached = 'ShinkaiBackendInferenceLimitReached',
}

function AgentSelection() {
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
      toast.error('Failed to update agent', {
        description: error.message,
      });
    },
  });
  return (
    <DropdownMenu>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger className="bg-gray-350 inline-flex cursor-pointer items-center justify-between gap-1 truncate rounded-xl px-2.5 py-1.5 text-start text-xs font-normal text-gray-50  hover:text-white  [&[data-state=open]>.icon]:rotate-180">
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
              Switch AI
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
                    {/*<span className="text-gray-80 text-xs">{agent.model}</span>*/}
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

export const Inbox = () => {
  const size = partial({ standard: 'jedec' });
  const { inboxId: encodedInboxId } = useParams<{ inboxId: string }>();
  const auth = useAuth((state) => state.auth);
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
    inboxId: decodeURIComponent(inboxId) as string,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
    refetchInterval: 5000,
  });

  const { mutateAsync: sendMessageToInbox } = useSendMessageToInbox();
  const { mutateAsync: sendMessageToJob } = useSendMessageToJob();
  const { mutateAsync: sendTextMessageWithFilesForInbox } =
    useSendMessageWithFilesToInbox();

  const fromPreviousMessagesRef = useRef<boolean>(false);
  const [isJobProcessingFile, setIsJobProcessingFile] =
    useState<boolean>(false);

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
    setTimeout(() => {
      chatForm.setFocus('message');
    }, 200);
  };

  const isLoadingMessage = useMemo(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    return isJobInbox(inboxId) && !!lastMessage?.isLocal;
  }, [data?.pages, inboxId]);

  useEffect(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    if (lastMessage) {
      setIsJobProcessingFile(
        isLoadingMessage && lastMessage.isLocal && !!lastMessage.fileInbox,
      );
    }
  }, [data?.pages, auth, isLoadingMessage]);

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
    <div className="flex h-full flex-col justify-between gap-3">
      <MessageList
        containerClassName="pr-4"
        fetchPreviousPage={fetchPreviousPage}
        fromPreviousMessagesRef={fromPreviousMessagesRef}
        hasPreviousPage={hasPreviousPage}
        isFetchingPreviousPage={isFetchingPreviousPage}
        isLoading={isChatConversationLoading}
        isSuccess={isChatConversationSuccess}
        noMoreMessageLabel="All previous messages have been loaded ✅"
        paginatedMessages={data}
      />
      {isJobProcessingFile && (
        <Alert className="shadow-lg">
          <Terminal className="h-4 w-4" />
          <AlertTitle className="text-sm">
            <FormattedMessage id="file-processing-alert-title" />
          </AlertTitle>
          <AlertDescription className="text-xs">
            <div className="flex flex-row items-center space-x-2">
              <span>
                <FormattedMessage id="file-processing-alert-description" />
              </span>
            </div>
          </AlertDescription>
          <Terminal className="h-4 w-4" />
        </Alert>
      )}
      {isLimitReachedErrorLastMessage && (
        <Alert className="shadow-lg" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm">
            <FormattedMessage id="limit-reached" />
          </AlertTitle>
          <AlertDescription className="text-gray-80 text-xs">
            <div className="flex flex-row items-center space-x-2">
              <FormattedMessage id="limit-reached-description" />
            </div>
          </AlertDescription>
        </Alert>
      )}
      {!isLimitReachedErrorLastMessage && (
        <div className="flex flex-col justify-start">
          <div className="relative flex items-start gap-2 pb-3">
            <Form {...chatForm}>
              <FormField
                control={chatForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-0">
                    <FormLabel className="sr-only">Enter message</FormLabel>
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
                                    className="sr-only"
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipPortal>
                                <TooltipContent
                                  align="center"
                                  className="bg-neutral-900"
                                  side="top"
                                >
                                  Upload a File
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
                              isLoading={isLoadingMessage}
                              onClick={chatForm.handleSubmit(onSubmit)}
                              size="icon"
                              variant="tertiary"
                            >
                              <SendIcon className="h-full w-full" />
                              <span className="sr-only">Send Message</span>
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
                                    className="text-gray-80 h-7 w-7 shrink-0 "
                                    type={getFileExt(file?.name)}
                                  />
                                ) : (
                                  <Paperclip className="text-gray-80 h-4 w-4 shrink-0" />
                                )}
                                <div className="space-y-1">
                                  <span className="line-clamp-1 break-all text-left text-xs ">
                                    {file?.name}
                                  </span>
                                  <span className="line-clamp-1 break-all text-left text-xs text-gray-100 ">
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
