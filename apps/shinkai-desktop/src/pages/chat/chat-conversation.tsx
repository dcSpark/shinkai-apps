import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  extractErrorPropertyOrContent,
  extractJobIdFromInbox,
  extractReceiverShinkaiName,
  isJobInbox,
} from '@shinkai_network/shinkai-message-ts/utils';
import { ShinkaiMessageBuilderWrapper } from '@shinkai_network/shinkai-message-ts/wasm/ShinkaiMessageBuilderWrapper';
import {
  ChatMessageFormSchema,
  chatMessageFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/chat/chat-message';
import { FunctionKey } from '@shinkai_network/shinkai-node-state/lib/constants';
import { useSendMessageToJob } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMessageToJob/useSendMessageToJob';
import { useSendMessageToInbox } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMesssageToInbox/useSendMessageToInbox';
import { useSendMessageWithFilesToInbox } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMesssageWithFilesToInbox/useSendMessageWithFilesToInbox';
import { useUpdateAgentInJob } from '@shinkai_network/shinkai-node-state/lib/mutations/updateAgentInJob/useUpdateAgentInJob';
import { useGetChatConversationWithPagination } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/useGetChatConversationWithPagination';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/lib/queries/getLLMProviders/useGetLLMProviders';
import { useGetWorkflowSearch } from '@shinkai_network/shinkai-node-state/lib/queries/getWorkflowSearch/useGetWorkflowSearch';
import { Models } from '@shinkai_network/shinkai-node-state/lib/utils/models';
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
  WorkflowPlaygroundIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { getFileExt } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { useQueryClient } from '@tanstack/react-query';
import { partial } from 'filesize';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  BotIcon,
  ChevronDownIcon,
  Paperclip,
  SendIcon,
  X,
  XIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';
import { toast } from 'sonner';

import { useWorkflowSelectionStore } from '../../components/workflow/context/workflow-selection-context';
import { useGetCurrentInbox } from '../../hooks/use-current-inbox';
import { useDebounce } from '../../hooks/use-debounce';
import { useAnalytics } from '../../lib/posthog-provider';
import { useAuth } from '../../store/auth';
import { formatWorkflowName } from '../create-job';
enum ErrorCodes {
  VectorResource = 'VectorResource',
  ShinkaiBackendInferenceLimitReached = 'ShinkaiBackendInferenceLimitReached',
}
type UseWebSocketMessage = {
  enabled?: boolean;
};
const useWebSocketMessage = ({ enabled }: UseWebSocketMessage) => {
  const auth = useAuth((state) => state.auth);
  const nodeAddressUrl = new URL(auth?.node_address ?? 'http://localhost:9850');
  const socketUrl = `ws://${nodeAddressUrl.hostname}:${Number(nodeAddressUrl.port) + 1}/ws`;
  const queryClient = useQueryClient();

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    socketUrl,
    { share: true },
    enabled,
  );
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);
  const [messageContent, setMessageContent] = useState('');
  useEffect(() => {
    if (!enabled) return;
    if (lastMessage?.data) {
      try {
        const parseData: {
          message_type: 'Stream' | 'ShinkaiMessage';
          inbox: string;
          message: string;
          error_message: string;
          metadata?: {
            id: string;
            is_done: boolean;
            done_reason: string;
            total_duration: number;
            eval_count: number;
          };
        } = JSON.parse(lastMessage.data);
        if (parseData.message_type !== 'Stream') return;
        if (parseData.metadata?.is_done) {
          const paginationKey = [
            FunctionKey.GET_CHAT_CONVERSATION_PAGINATION,
            {
              nodeAddress: auth?.node_address ?? '',
              inboxId: inboxId as string,
              shinkaiIdentity: auth?.shinkai_identity ?? '',
              profile: auth?.profile ?? '',
              my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
              my_device_identity_sk: auth?.my_device_identity_sk ?? '',
              node_encryption_pk: auth?.node_encryption_pk ?? '',
              profile_encryption_sk: auth?.profile_encryption_sk ?? '',
              profile_identity_sk: auth?.profile_identity_sk ?? '',
            },
          ];
          queryClient.invalidateQueries({ queryKey: paginationKey });
        }

        setMessageContent((prev) => prev + parseData.message);
        return;
      } catch (error) {
        console.error('Failed to parse ws message', error);
      }
    }
  }, [
    auth?.my_device_encryption_sk,
    auth?.my_device_identity_sk,
    auth?.node_address,
    auth?.node_encryption_pk,
    auth?.profile,
    auth?.profile_encryption_sk,
    auth?.profile_identity_sk,
    auth?.shinkai_identity,
    enabled,
    inboxId,
    lastMessage?.data,
    queryClient,
  ]);

  useEffect(() => {
    if (!enabled) return;
    const wsMessage = {
      subscriptions: [{ topic: 'inbox', subtopic: inboxId }],
      unsubscriptions: [],
    };
    const wsMessageString = JSON.stringify(wsMessage);
    const shinkaiMessage = ShinkaiMessageBuilderWrapper.ws_connection(
      wsMessageString,
      auth?.profile_encryption_sk ?? '',
      auth?.profile_identity_sk ?? '',
      auth?.node_encryption_pk ?? '',
      auth?.shinkai_identity ?? '',
      auth?.profile ?? '',
      auth?.shinkai_identity ?? '',
      '',
    );
    sendMessage(shinkaiMessage);
  }, [
    auth?.node_encryption_pk,
    auth?.profile,
    auth?.profile_encryption_sk,
    auth?.profile_identity_sk,
    auth?.shinkai_identity,
    enabled,
    inboxId,
    sendMessage,
  ]);

  return { messageContent, readyState, setMessageContent };
};
const ChatConversation = () => {
  const { captureAnalyticEvent } = useAnalytics();
  const { t } = useTranslation();
  const size = partial({ standard: 'jedec' });
  const { inboxId: encodedInboxId = '' } = useParams();
  const auth = useAuth((state) => state.auth);
  const fromPreviousMessagesRef = useRef<boolean>(false);

  const inboxId = decodeURIComponent(encodedInboxId);
  const currentInbox = useGetCurrentInbox();
  const hasProviderEnableStreaming =
    currentInbox?.agent?.model.split(':')?.[0] === Models.Ollama ||
    currentInbox?.agent?.model.split(':')?.[0] === Models.Gemini ||
    currentInbox?.agent?.model.split(':')?.[0] === Models.Exo;

  const chatForm = useForm<ChatMessageFormSchema>({
    resolver: zodResolver(chatMessageFormSchema),
    defaultValues: {
      message: '',
    },
  });

  const workflowSelected = useWorkflowSelectionStore(
    (state) => state.workflowSelected,
  );
  const setWorkflowSelected = useWorkflowSelectionStore(
    (state) => state.setWorkflowSelected,
  );

  const currentMessage = useWatch({
    control: chatForm.control,
    name: 'message',
  });
  const debounceMessage = useDebounce(currentMessage, 500);

  const { getRootProps: getRootFileProps, getInputProps: getInputFileProps } =
    useDropzone({
      multiple: false,
      onDrop: (acceptedFiles) => {
        const file = acceptedFiles[0];
        chatForm.setValue('file', file, { shouldValidate: true });
      },
    });

  const currentFile = useWatch({
    control: chatForm.control,
    name: 'file',
  });

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
    refetchIntervalEnabled: !hasProviderEnableStreaming,
  });

  const {
    data: workflowRecommendations,
    isSuccess: isWorkflowRecommendationsSuccess,
  } = useGetWorkflowSearch(
    {
      nodeAddress: auth?.node_address ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      profile: auth?.profile ?? '',
      search: debounceMessage,
      my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
      my_device_identity_sk: auth?.my_device_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    },
    {
      enabled: !!debounceMessage && !!currentMessage,
      select: (data) => data.slice(0, 3),
    },
  );

  const [firstMessageWorkflow, setFirstMessageWorkflow] = useState<{
    name: string;
    version: string;
  } | null>(null);

  useEffect(() => {
    if (data?.pages && data.pages.length > 0 && data.pages[0].length > 0) {
      const firstMessage = data.pages[0][0];
      if (firstMessage.workflowName) {
        const [name, version] = firstMessage.workflowName.split(':::');
        setFirstMessageWorkflow({ name, version });
      }
    }
  }, [data?.pages]);

  const isLoadingMessage = useMemo(() => {
    const lastMessage = data?.pages?.at(-1)?.at(-1);
    return isJobInbox(inboxId) && lastMessage?.isLocal;
  }, [data?.pages, inboxId]);

  const { messageContent, setMessageContent } = useWebSocketMessage({
    enabled: hasProviderEnableStreaming,
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

  const regenerateMessage = async (
    content: string,
    parentHash: string,
    workflowName?: string,
  ) => {
    setMessageContent(''); // trick to clear the ws stream message
    if (!auth) return;
    const decodedInboxId = decodeURIComponent(inboxId);
    const jobId = extractJobIdFromInbox(decodedInboxId);

    await sendMessageToJob({
      nodeAddress: auth.node_address,
      jobId,
      message: content,
      files_inbox: '',
      parent: parentHash,
      workflowName,
      shinkaiIdentity: auth.shinkai_identity,
      profile: auth.profile,
      my_device_encryption_sk: auth.my_device_encryption_sk,
      my_device_identity_sk: auth.my_device_identity_sk,
      node_encryption_pk: auth.node_encryption_pk,
      profile_encryption_sk: auth.profile_encryption_sk,
      profile_identity_sk: auth.profile_identity_sk,
    });
  };

  const onSubmit = async (data: ChatMessageFormSchema) => {
    setMessageContent(''); // trick to clear the ws stream message
    if (!auth || data.message.trim() === '') return;
    fromPreviousMessagesRef.current = false;

    let workflowToUse = workflowSelected;
    if (!workflowToUse && firstMessageWorkflow) {
      workflowToUse = {
        name: firstMessageWorkflow.name,
        version: firstMessageWorkflow.version,
        description: '', // We don't have this information from the first message
        raw: '', // We don't have this information from the first message
      };
    }

    const workflowVersion = workflowToUse?.version;
    const workflowName = workflowToUse?.name;

    if (data.file) {
      await sendTextMessageWithFilesForInbox({
        nodeAddress: auth?.node_address ?? '',
        sender: auth.shinkai_identity,
        senderSubidentity: auth.profile,
        receiver: auth.shinkai_identity,
        message: data.message,
        inboxId: inboxId,
        files: [currentFile],
        workflowName: workflowToUse
          ? `${workflowName}:::${workflowVersion}`
          : undefined,
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
        workflowName: workflowToUse
          ? `${workflowName}:::${workflowVersion}`
          : undefined,
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
    setWorkflowSelected(undefined);
  };

  useEffect(() => {
    chatForm.reset();
    setWorkflowSelected(undefined);
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

  const isWorkflowSelectedAndFilesPresent =
    workflowSelected && currentFile !== undefined;

  useEffect(() => {
    if (isWorkflowSelectedAndFilesPresent) {
      chatForm.setValue(
        'message',
        `${formatWorkflowName(workflowSelected.name)} - ${workflowSelected.description}`,
      );
    }
  }, [chatForm, isWorkflowSelectedAndFilesPresent, workflowSelected]);

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
        isLoadingMessage={isLoadingMessage}
        isSuccess={isChatConversationSuccess}
        lastMessageContent={messageContent}
        noMoreMessageLabel={t('chat.allMessagesLoaded')}
        paginatedMessages={data}
        regenerateMessage={regenerateMessage}
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
                                <TooltipContent align="center" side="top">
                                  {t('common.uploadFile')}
                                </TooltipContent>
                              </TooltipPortal>
                            </Tooltip>
                          </TooltipProvider>
                          <WorkflowSelection />
                        </div>
                        <ChatInputArea
                          autoFocus
                          bottomAddons={
                            <Button
                              className="hover:bg-app-gradient h-[40px] w-[40px] self-end rounded-xl bg-gray-500 p-3 disabled:cursor-not-allowed"
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
                          disabled={
                            isLoadingMessage ||
                            isWorkflowSelectedAndFilesPresent
                          }
                          // isLoading={isLoadingMessage}
                          onChange={field.onChange}
                          onSubmit={chatForm.handleSubmit(onSubmit)}
                          topAddons={
                            <>
                              {workflowSelected && (
                                <div className="relative max-w-full rounded-lg border border-gray-200 p-1.5 px-2">
                                  <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2 pr-6">
                                          <WorkflowPlaygroundIcon className="h-3.5 w-3.5" />
                                          <div className="text-gray-80 line-clamp-1 text-xs">
                                            <span className="text-white">
                                              {formatWorkflowName(
                                                workflowSelected.name,
                                              )}{' '}
                                            </span>
                                            -{' '}
                                            <span className="">
                                              {workflowSelected.description}
                                            </span>
                                          </div>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipPortal>
                                        <TooltipContent
                                          align="end"
                                          alignOffset={-10}
                                          className="max-w-[400px]"
                                          side="top"
                                          sideOffset={10}
                                        >
                                          {workflowSelected.description}
                                        </TooltipContent>
                                      </TooltipPortal>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <button
                                    className="absolute right-2 top-1.5 text-gray-100 hover:text-white"
                                    onClick={() => {
                                      setWorkflowSelected(undefined);
                                    }}
                                    type="button"
                                  >
                                    <XIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                              {currentFile && (
                                <div className="relative mt-1 flex min-w-[180px] max-w-[220px] items-center gap-2 self-start rounded-lg border border-gray-200 px-2 py-2.5">
                                  {getFileExt(currentFile?.name) &&
                                  fileIconMap[getFileExt(currentFile?.name)] ? (
                                    <FileTypeIcon
                                      className="text-gray-80 h-7 w-7 shrink-0"
                                      type={getFileExt(currentFile?.name)}
                                    />
                                  ) : (
                                    <Paperclip className="text-gray-80 h-4 w-4 shrink-0" />
                                  )}
                                  <div className="space-y-1">
                                    <span className="line-clamp-1 break-all text-left text-xs">
                                      {currentFile?.name}
                                    </span>
                                    <span className="line-clamp-1 break-all text-left text-xs text-gray-100">
                                      {size(currentFile?.size)}
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
                              )}
                            </>
                          }
                          value={field.value}
                        />
                        <motion.div
                          animate={{ opacity: 1 }}
                          className="absolute inset-x-3 bottom-2 flex items-center justify-between gap-2"
                          exit={{ opacity: 0 }}
                          initial={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex gap-2">
                            {!!debounceMessage &&
                              !workflowSelected &&
                              isWorkflowRecommendationsSuccess &&
                              workflowRecommendations?.length > 0 &&
                              workflowRecommendations?.map((workflow) => (
                                <motion.button
                                  animate={{ opacity: 1, x: 0 }}
                                  className={cn(
                                    'hover:bg-brand-gradient bg-gray-350 flex items-center gap-2 rounded-lg px-2 py-1 text-xs text-white',
                                  )}
                                  exit={{ opacity: 0, x: -10 }}
                                  initial={{ opacity: 0, x: -10 }}
                                  key={workflow.Workflow.workflow.name}
                                  onClick={() => {
                                    setWorkflowSelected({
                                      description:
                                        workflow.Workflow.workflow.description,
                                      name: workflow.Workflow.workflow.name,
                                      raw: workflow.Workflow.workflow.raw,
                                      version:
                                        workflow.Workflow.workflow.version,
                                    });
                                  }}
                                  type="button"
                                >
                                  <WorkflowPlaygroundIcon className="h-3 w-3" />
                                  {formatWorkflowName(
                                    workflow.Workflow.workflow.name,
                                  )}
                                </motion.button>
                              ))}
                          </div>
                        </motion.div>
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
  const { llmProviders } = useGetLLMProviders({
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
      toast.error(t('llmProviders.errors.updateAgent'), {
        description: error.message,
      });
    },
  });
  return (
    <DropdownMenu>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger className="bg-gray-350 inline-flex cursor-pointer items-center justify-between gap-1.5 truncate rounded-xl px-2.5 py-1.5 text-start text-xs font-normal text-gray-50 hover:text-white [&[data-state=open]>.icon]:rotate-180">
              <BotIcon className="mr-1 h-4 w-4" />
              <span>{currentInbox?.agent?.id}</span>
              <ChevronDownIcon className="icon h-3 w-3" />
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent align="center" side="top">
              {t('llmProviders.switch')}
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
              {llmProviders.map((agent) => (
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

function WorkflowSelection() {
  const setWorkflowSelectionDrawerOpen = useWorkflowSelectionStore(
    (state) => state.setWorkflowSelectionDrawerOpen,
  );

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="hover:bg-gray-350 flex h-7 w-7 cursor-pointer items-center justify-center gap-1.5 truncate rounded-lg px-2.5 py-1.5 text-left text-xs font-normal text-white hover:text-white [&[data-state=open]>.icon]:rotate-180"
            onClick={() => {
              setWorkflowSelectionDrawerOpen(true);
            }}
          >
            <WorkflowPlaygroundIcon className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent align="center" side="top">
            Add Workflow
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
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
                    count: (currentInbox?.job_scope?.vector_fs_folders ?? [])
                      .length,
                  })}
                </span>
              )}
              {hasFiles && (
                <span className="text-gray-80 flex items-center gap-1 truncate text-xs font-medium">
                  <FileTypeIcon className="ml-1 h-4 w-4" />
                  {t('common.fileWithCount', {
                    count: (currentInbox?.job_scope?.vector_fs_items ?? [])
                      .length,
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
                            key={folder}
                          >
                            <DirectoryTypeIcon />
                            <span className="text-gray-80 text-xs text-white">
                              {folder}
                            </span>
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
                          key={file}
                        >
                          <FileTypeIcon />
                          <span className="text-gray-80 text-xs text-white">
                            {file}
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
