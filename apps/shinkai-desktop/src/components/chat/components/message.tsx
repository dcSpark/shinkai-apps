import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  type ToolArgs,
  ToolStatusType,
} from '@shinkai_network/shinkai-message-ts/api/general/types';
import { type MessageTrace } from '@shinkai_network/shinkai-message-ts/api/jobs/types';
import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils';
import {
  type AssistantMessage,
  type FormattedMessage,
  type TextStatus,
  type ToolCall,
} from '@shinkai_network/shinkai-node-state/v2/queries/getChatConversation/types';
import { useGetMessageTraces } from '@shinkai_network/shinkai-node-state/v2/queries/getMessageTraces/useGetMessageTraces';
import { useGetNetworkAgents } from '@shinkai_network/shinkai-node-state/v2/queries/getNetworkAgents/useGetNetworkAgents';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Avatar,
  AvatarFallback,
  Button,
  Card,
  CardContent,
  ChatInputArea,
  CopyToClipboardIcon,
  DotsLoader,
  FileList,
  Form,
  FormField,
  MarkdownText,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
  PrettyJsonPrint,
} from '@shinkai_network/shinkai-ui';
import {
  AisIcon,
  appIcon,
  ReactJsIcon,
  ReasoningIcon,
  ToolsIcon,
  TracingIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { format } from 'date-fns';
import equal from 'fast-deep-equal';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Edit3,
  GitFork,
  InfoIcon,
  Loader2,
  RotateCcw,
  Unplug,
  XCircle,
  Zap,
  User,
  Cpu,
} from 'lucide-react';
import React, { Fragment, memo, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { z } from 'zod';

import { useAuth } from '../../../store/auth';
import { useOAuth } from '../../../store/oauth';
import { useSettings } from '../../../store/settings';
import { oauthUrlMatcherFromErrorMessage } from '../../../utils/oauth';

import { useChatStore } from '../context/chat-context';
import { PythonCodeRunner } from '../python-code-runner/python-code-runner';

export const extractErrorPropertyOrContent = (
  content: string,
  property: 'error' | 'error_message',
) => {
  try {
    const parsedContent = JSON.parse(content);
    if (property in parsedContent) {
      return parsedContent[property];
    }
  } catch {
    /* ignore */
  }
  return String(content);
};

const containsPythonCode = (content: string): boolean => {
  const pythonCodeRegex = /```python\s[\s\S]*?```/;
  return pythonCodeRegex.test(content);
};

type MessageProps = {
  messageId: string;
  isPending?: boolean;
  message: FormattedMessage;
  handleRetryMessage?: () => void;
  handleForkMessage?: () => void;
  disabledRetry?: boolean;
  disabledEdit?: boolean;
  handleEditMessage?: (message: string) => void;
  messageExtra?: React.ReactNode;
  hidePythonExecution?: boolean;
  minimalistMode?: boolean;
};

const actionBar = {
  rest: {
    opacity: 0,
    scale: 0.8,
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.3,
    },
  },
  hover: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      duration: 0.3,
      bounce: 0,
    },
  },
};

type ArtifactProps = {
  title: string;
  type: string;
  identifier: string;
  loading?: boolean;
  isSelected?: boolean;
  onArtifactClick?: () => void;
};
const ArtifactCard = ({
  title,
  loading = true,
  onArtifactClick,
  isSelected,
  // identifier,
}: ArtifactProps) => (
  <Card
    className={cn(
      'w-full max-w-sm border border-gray-100',
      isSelected && 'border-gray-50 bg-gray-300',
    )}
    onClick={() => {
      onArtifactClick?.();
    }}
    role="button"
  >
    <CardContent className="flex items-center gap-1 p-1 py-1.5">
      <div className="rounded-md p-2">
        {loading ? (
          <Loader2 className="text-gray-80 h-5 w-5 animate-spin" />
        ) : (
          <ReactJsIcon
            className={cn(isSelected ? 'text-gray-50' : 'text-gray-80')}
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="text-em-sm text-official-gray-50 !mb-0 line-clamp-1 font-medium">
          {title}
        </p>
        <p className="text-gray-80 !mb-0 text-xs">
          {loading ? 'Generating...' : 'Click to preview'}
        </p>
      </div>
    </CardContent>
  </Card>
);

export const editMessageFormSchema = z.object({
  message: z.string().min(1),
});

type EditMessageFormSchema = z.infer<typeof editMessageFormSchema>;

export const MessageBase = ({
  message,
  messageId,
  // messageId,
  hidePythonExecution,
  isPending,
  handleRetryMessage,
  handleForkMessage,
  disabledRetry,
  disabledEdit,
  handleEditMessage,
  minimalistMode = false,
}: MessageProps) => {
  const { t } = useTranslation();

  const selectedArtifact = useChatStore((state) => state.selectedArtifact);
  const setArtifact = useChatStore((state) => state.setSelectedArtifact);

  const auth = useAuth((state) => state.auth);

  const getChatFontSizeInPts = useSettings(
    (state) => state.getChatFontSizeInPts,
  );

  const [editing, setEditing] = useState(false);
  const [tracingOpen, setTracingOpen] = useState(false);

  const editMessageForm = useForm<EditMessageFormSchema>({
    resolver: zodResolver(editMessageFormSchema),
    defaultValues: {
      message: message.content,
    },
  });

  const { message: currentMessage } = editMessageForm.watch();

  const parentMessageId = message.metadata.parentMessageId;

  const onSubmit = async (data: z.infer<typeof editMessageFormSchema>) => {
    if (message.role === 'user') {
      handleEditMessage?.(data.message);
      setEditing(false);
    }
  };

  useEffect(() => {
    if (message.role === 'user') {
      editMessageForm.reset({ message: message.content });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMessageForm, message.content]);

  const pythonCode = useMemo(() => {
    if (containsPythonCode(message.content)) {
      const match = message.content.match(/```python\s([\s\S]*?)```/);
      return match ? match[1] : null;
    }
    return null;
  }, [message.content]);

  const oauthUrl = useMemo(() => {
    return oauthUrlMatcherFromErrorMessage(message.content);
  }, [message.content]);

  const configDeepLinkMatcher = (content: string) => {
    const match = content.match(/shinkai:\/\/config\?tool=([^\s]+)/);
    return match ? match[1] : null;
  };

  const configDeepLinkToolRouterKey = useMemo(() => {
    if (!message?.content) return null;
    return configDeepLinkMatcher(message.content);
  }, [message]);

  const { setOauthModalVisible } = useOAuth();

  return (
    <motion.div
      animate="rest"
      className={cn('pb-10', minimalistMode && 'pb-3')}
      data-testid={`message-${
        message.role === 'user' ? 'local' : 'remote'
      }-${message.messageId}`}
      id={message.messageId}
      initial="rest"
      style={{ fontSize: `${getChatFontSizeInPts()}px` }}
      whileHover="hover"
    >
      <div
        className={cn(
          'relative flex flex-row space-x-2',
          message.role === 'user' &&
            'mr-0 ml-auto flex-row-reverse space-x-reverse',
          message.role === 'assistant' && 'mr-auto ml-0 flex-row items-end',
        )}
      >
        <Avatar
          className={cn('mt-1 h-8 w-8', minimalistMode && 'mt-1.5 h-5 w-5')}
        >
          {message.role === 'assistant' ? (
            <img alt="Shinkai AI" src={appIcon} />
          ) : (
            <AvatarFallback
              className={cn(
                'text-em-xs text-official-gray-300 bg-official-gray-850 border-official-gray-780 h-8 w-8 border',
                minimalistMode && 'text-em-xs h-5 w-5',
              )}
            >
              U
            </AvatarFallback>
          )}
        </Avatar>
        <div
          className={cn(
            'text-em-base flex flex-col overflow-hidden bg-transparent text-white',
            editing && 'w-full py-1',
          )}
        >
          {editing ? (
            <Form {...editMessageForm}>
              <form
                className="relative flex items-center"
                onSubmit={editMessageForm.handleSubmit(onSubmit)}
              >
                <div className="w-full">
                  <FormField
                    control={editMessageForm.control}
                    name="message"
                    render={({ field }) => (
                      <ChatInputArea
                        bottomAddons={
                          <div className="flex w-full items-center justify-between px-1">
                            <div className="text-em-xs text-official-gray-400 flex items-center gap-1">
                              <InfoIcon className="text-official-gray-400 h-3 w-3" />
                              <span>{t('chat.editMessage.warning')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                className="min-w-[90px]"
                                onClick={() => setEditing(false)}
                                rounded="lg"
                                size="xs"
                                variant="outline"
                              >
                                {t('common.cancel')}
                              </Button>
                              <Button
                                className="min-w-[90px]"
                                disabled={!currentMessage}
                                onClick={editMessageForm.handleSubmit(onSubmit)}
                                rounded="lg"
                                size="xs"
                              >
                                {t('common.send')}
                              </Button>
                            </div>
                          </div>
                        }
                        onChange={field.onChange}
                        onSubmit={editMessageForm.handleSubmit(onSubmit)}
                        value={field.value}
                      />
                    )}
                  />
                </div>
              </form>
            </Form>
          ) : (
            <Fragment>
              <div
                className={cn(
                  'relative mt-1 flex flex-col rounded-lg px-3.5 pt-3 text-white',
                  message.role === 'user'
                    ? 'bg-official-gray-850 rounded-tr-none'
                    : 'bg-official-gray-780 rounded-bl-none border-none',
                  !message.content ? 'pb-3' : 'pb-4',
                  editing && 'w-full py-1',
                  message.role === 'assistant' &&
                    isPending &&
                    'relative overflow-hidden pb-4 before:absolute before:right-0 before:bottom-0 before:left-0 before:h-10 before:animate-pulse before:bg-gradient-to-l before:from-gray-200 before:to-gray-200/10',
                  minimalistMode && 'rounded-xs px-2 pt-1.5 pb-1.5',
                )}
              >
                {message.role === 'assistant' && message.reasoning != null && (
                  <Reasoning
                    reasoning={message.reasoning.text}
                    status={message.reasoning.status}
                  />
                )}

                {message.role === 'assistant' &&
                  message.toolCalls &&
                  message.toolCalls.length > 0 && (
                    <Accordion
                      className="max-w-full space-y-1.5 self-baseline overflow-x-auto pb-3"
                      type="multiple"
                    >
                      {message.toolCalls.map((tool, index) => {
                        return (
                          <AccordionItem
                            className="bg-official-gray-950 border-official-gray-750 overflow-hidden rounded-lg border"
                            disabled={tool.status !== ToolStatusType.Complete}
                            key={`${tool.name}-${index}`}
                            value={`${tool.name}-${index}`}
                          >
                            <div className="flex items-center">
                              <AccordionTrigger
                                className={cn(
                                  'min-w-[10rem] flex-1 gap-3 py-0 pr-2 no-underline hover:no-underline',
                                  'hover:bg-official-gray-900 [&[data-state=open]]:bg-official-gray-950 transition-colors',
                                  tool.status !== ToolStatusType.Complete &&
                                    '[&>svg]:hidden',
                                )}
                              >
                                <ToolCard
                                  args={tool.args}
                                  name={tool.name}
                                  status={
                                    tool.status ?? ToolStatusType.Complete
                                  }
                                  toolRouterKey={tool.toolRouterKey}
                                />
                              </AccordionTrigger>
                              <Button
                                variant="outline"
                                size="xs"
                                className="mr-2 ml-2 h-6 px-2"
                                onClick={() => setTracingOpen(true)}
                                onMouseDown={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                              >
                                Network Tracing
                              </Button>
                            </div>
                            <AccordionContent className="bg-official-gray-950 flex flex-col gap-1 rounded-b-lg px-3 pt-2 pb-3 text-xs">
                              {Object.keys(tool.args).length > 0 && (
                                <span className="font-medium text-white">
                                  {tool.name}(
                                  {Object.keys(tool.args).length > 0 && (
                                    <span className="text-official-gray-400 font-mono font-medium">
                                      <PrettyJsonPrint json={tool.args} />
                                    </span>
                                  )}
                                  )
                                </span>
                              )}
                              {tool.result && (
                                <div>
                                  <span>Response:</span>
                                  <span className="text-official-gray-400 font-mono break-all">
                                    <PrettyJsonPrint json={tool.result} />
                                  </span>
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  )}

                {message.role === 'assistant' && (
                  <MarkdownText
                    className={cn(
                      message.reasoning?.status?.type === 'running' &&
                        'text-official-gray-400',
                    )}
                    content={extractErrorPropertyOrContent(
                      message.content
                        .replace(/<think>[\s\S]*?<\/think>/g, '')
                        .replace('<think>', ''),
                      'error_message',
                    )}
                    isRunning={
                      !!message.content && message.status.type === 'running'
                    }
                  />
                )}
                {message.role === 'assistant' &&
                  message.artifacts?.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-3">
                      {message.artifacts.map((artifact) => (
                        <ArtifactCard
                          identifier={artifact.identifier}
                          isSelected={
                            selectedArtifact?.identifier === artifact.identifier
                          }
                          key={artifact.identifier}
                          loading={false}
                          onArtifactClick={() => {
                            if (
                              selectedArtifact?.identifier ===
                              artifact.identifier
                            ) {
                              setArtifact(null);
                              return;
                            }
                            setArtifact(artifact);
                          }}
                          title={artifact.title}
                          type={artifact.type}
                        />
                      ))}
                    </div>
                  )}
                {message.role === 'user' && (
                  <div className="whitespace-pre-line">{message.content}</div>
                )}
                {message.role === 'assistant' &&
                  message.toolCalls?.some(
                    (tool) => tool.status === 'Running',
                  ) &&
                  message.content === '' && (
                    <div className="pt-1.5 whitespace-pre-line">
                      <span className="text-official-gray-400 text-xs">
                        Executing tools
                      </span>
                    </div>
                  )}
                {message.role === 'assistant' &&
                  message.toolCalls?.length > 0 &&
                  message.toolCalls?.every(
                    (tool) => tool.status === 'Complete',
                  ) &&
                  message.content === '' && (
                    <div className="pt-1.5 whitespace-pre-line">
                      <span className="text-official-gray-400 text-xs">
                        Getting AI response
                      </span>
                    </div>
                  )}
                {message.role === 'assistant' &&
                  message.status.type === 'running' &&
                  message.content === '' && (
                    <div className="pt-1.5 whitespace-pre-line">
                      <DotsLoader />
                    </div>
                  )}
                {pythonCode &&
                  !hidePythonExecution &&
                  message.metadata.inboxId && (
                    <PythonCodeRunner
                      code={pythonCode}
                      jobId={extractJobIdFromInbox(message.metadata.inboxId)}
                      nodeAddress={auth?.node_address ?? ''}
                      token={auth?.api_v2_key ?? ''}
                    />
                  )}

                {oauthUrl && (
                  <div className="bg-official-gray-900 mt-4 flex flex-col items-start rounded-lg p-4">
                    <p className="text-em-lg mb-2 font-semibold text-white">
                      <div className="flex items-center">
                        <Unplug className="mr-2 h-5 w-5" />
                        {t('oauth.connectionRequired')}
                      </div>
                    </p>
                    <p className="text-em-sm mb-4 text-white">
                      {t('oauth.connectionRequiredDescription', {
                        provider: new URL(oauthUrl).hostname,
                      })}
                    </p>
                    <Button
                      className="rounded-lg px-4 py-2 text-white transition duration-300"
                      onClick={() =>
                        setOauthModalVisible({ visible: true, url: oauthUrl })
                      }
                      variant="outline"
                    >
                      {t('oauth.connectNow')}
                    </Button>
                  </div>
                )}

                {configDeepLinkToolRouterKey && (
                  <div className="mt-4 flex flex-col items-start rounded-lg bg-gray-950 p-6 shadow-lg">
                    <p className="text-em-base mb-3 font-semibold text-white">
                      <div className="flex items-center">
                        <ToolsIcon className="text-brand mr-3 size-4" />
                        {t('tools.setupRequired')}
                      </div>
                    </p>
                    <p className="text-em-base text-official-gray-400 mb-5 leading-relaxed">
                      {t('tools.setupDescription')}
                    </p>
                    <Link to={`/tools/${configDeepLinkToolRouterKey}`}>
                      <Button variant="default" size="sm">
                        <ToolsIcon className="h-4 w-4 transition-transform group-hover:rotate-12" />
                        {t('tools.setupNow')}
                      </Button>
                    </Link>
                  </div>
                )}

                {message.role === 'user' && !!message.attachments.length && (
                  <FileList className="mt-2" files={message.attachments} />
                )}

                {message.role === 'assistant' &&
                  message.toolCalls?.some((tool) => !!tool.generatedFiles) && (
                    <GeneratedFiles toolCalls={message.toolCalls} />
                  )}
              </div>
              {!isPending && !minimalistMode && (
                <motion.div
                  className={cn(
                    'absolute -bottom-[34px] flex items-center justify-end gap-3',
                    message.role === 'user'
                      ? 'right-10 flex-row-reverse'
                      : 'left-10 flex-row',
                  )}
                  variants={actionBar}
                >
                  <div className="flex items-center gap-1.5">
                    {message.role === 'user' && !disabledEdit && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className={cn(
                              'text-gray-80 border-official-gray-780 flex h-7 w-7 items-center justify-center rounded-lg border bg-transparent transition-colors hover:bg-gray-300 hover:text-white [&>svg]:h-3 [&>svg]:w-3',
                            )}
                            onClick={() => {
                              setEditing(true);
                            }}
                          >
                            <Edit3 />
                          </button>
                        </TooltipTrigger>
                        <TooltipPortal>
                          <TooltipContent>
                            <p>{t('common.editMessage')}</p>
                          </TooltipContent>
                        </TooltipPortal>
                      </Tooltip>
                    )}
                    {message.role === 'assistant' && !disabledRetry && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className={cn(
                                'text-official-gray-400 border-official-gray-780 flex h-7 w-7 items-center justify-center rounded-lg border bg-transparent transition-colors hover:bg-gray-300 hover:text-white [&>svg]:h-3 [&>svg]:w-3',
                              )}
                              onClick={handleForkMessage}
                            >
                              <GitFork />
                            </button>
                          </TooltipTrigger>
                          <TooltipPortal>
                            <TooltipContent>
                              <p>Fork</p>
                            </TooltipContent>
                          </TooltipPortal>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className={cn(
                                'text-official-gray-400 border-official-gray-780 flex h-7 w-7 items-center justify-center rounded-lg border bg-transparent transition-colors hover:bg-gray-300 hover:text-white [&>svg]:h-3 [&>svg]:w-3',
                              )}
                              onClick={handleRetryMessage}
                            >
                              <RotateCcw />
                            </button>
                          </TooltipTrigger>
                          <TooltipPortal>
                            <TooltipContent>
                              <p>{t('common.retry')}</p>
                            </TooltipContent>
                          </TooltipPortal>
                        </Tooltip>
                      </>
                    )}

                    {message.role === 'assistant' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className={cn(
                              'text-official-gray-400 border-official-gray-780 flex h-7 w-7 items-center justify-center rounded-lg border bg-transparent transition-colors hover:bg-gray-300 [&>svg]:h-3 [&>svg]:w-3',
                            )}
                            onClick={() => setTracingOpen(true)}
                          >
                            <TracingIcon />
                          </button>
                        </TooltipTrigger>
                        <TooltipPortal>
                          <TooltipContent>
                            <p>{t('chat.tracing.title')}</p>
                          </TooltipContent>
                        </TooltipPortal>
                        <TracingDialog
                          open={tracingOpen}
                          onOpenChange={setTracingOpen}
                          parentMessageId={parentMessageId}
                        />
                      </Tooltip>
                    )}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <CopyToClipboardIcon
                            className={cn(
                              'text-gray-80 border-official-gray-780 h-7 w-7 border bg-transparent hover:bg-gray-300 [&>svg]:h-3 [&>svg]:w-3',
                            )}
                            string={extractErrorPropertyOrContent(
                              message.content,
                              'error_message',
                            )}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipPortal>
                        <TooltipContent>
                          <p>{t('common.copy')}</p>
                        </TooltipContent>
                      </TooltipPortal>
                    </Tooltip>
                  </div>
                  <div
                    className={cn('flex items-center gap-1.5 text-gray-100')}
                  >
                    <span>
                      {format(new Date(message?.createdAt ?? ''), 'p')}
                    </span>
                    {message.role === 'assistant' && message?.metadata?.tps && (
                      <>
                        {' '}
                        ⋅
                        <span>
                          {Math.round(Number(message?.metadata?.tps) * 10) / 10}{' '}
                          tokens/s
                        </span>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </Fragment>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const Message = memo(MessageBase, (prev, next) => {
  return (
    prev.messageId === next.messageId &&
    prev.message.content === next.message.content &&
    prev.minimalistMode === next.minimalistMode &&
    equal(
      (prev.message as AssistantMessage).toolCalls,
      (next.message as AssistantMessage).toolCalls,
    )
  );
});

const variants = {
  initial: { opacity: 0, y: -25 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 25 },
};

export function ToolCard({
  name,
  // args,
  status,
  toolRouterKey,
}: {
  args: ToolArgs;
  status: ToolStatusType;
  name: string;
  toolRouterKey: string;
}) {
  const { data: networkAgents } = useGetNetworkAgents();
  const { t } = useTranslation();

  const isNetworkTool = (networkAgents ?? [])?.some(
    (agent) => agent.toolRouterKey === toolRouterKey,
  );

  const renderStatus = () => {
    if (status === ToolStatusType.Complete) {
      return <ToolsIcon className="text-brand size-full" />;
    }
    if (status === ToolStatusType.Incomplete) {
      return <XCircle className="text-official-gray-400 size-full" />;
    }
    if (status === ToolStatusType.RequiresAction) {
      return <InfoIcon className="text-official-gray-400 size-full" />;
    }
    return <Loader2 className="text-brand size-full animate-spin" />;
  };

  const renderLabelText = () => {
    if (status === ToolStatusType.Complete) {
      return isNetworkTool ? t('chat.networkAgentUsed') : t('chat.toolUsed');
    }
    if (status === ToolStatusType.Incomplete) {
      return t('common.incomplete');
    }
    if (status === ToolStatusType.RequiresAction) {
      return t('common.requiresAction');
    }
    return isNetworkTool
      ? t('chat.processingNetworkAgent')
      : t('chat.processingTool');
  };

  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.div
        animate="visible"
        exit="exit"
        initial="initial"
        transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
        variants={variants}
      >
        <div className="flex items-center gap-1 p-[5px]">
          <div className="size-7 shrink-0 px-1.5">{renderStatus()}</div>
          <div className="flex items-center gap-1">
            <span className="text-gray-80 text-em-sm">{renderLabelText()}</span>
            <Link
              className="text-em-sm font-semibold text-white hover:underline"
              to={`/tools/${toolRouterKey}`}
            >
              {formatText(name)}
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
export function Reasoning({
  reasoning,
  status,
}: {
  reasoning: string;
  status?: TextStatus;
}) {
  const { t } = useTranslation();
  const renderStatus = () => {
    if (status?.type === 'complete') {
      return <ReasoningIcon className="text-brand size-full" />;
    }
    if (status?.type === 'incomplete') {
      return <XCircle className="text-official-gray-400 size-full" />;
    }
    if (status?.type === 'running') {
      return null;
    }
    return null;
  };

  const renderReasoningText = () => {
    if (status?.type === 'complete') {
      return t('common.reasoning');
    }
    return t('common.thinking');
  };

  return (
    <Accordion
      className="max-w-full space-y-1.5 self-baseline overflow-x-auto pb-3"
      collapsible
      type="single"
    >
      <AccordionItem
        className={cn(
          'bg-official-gray-950 border-official-gray-750 overflow-hidden rounded-lg border',
          status?.type === 'running' &&
            'animate-pulse border-none bg-transparent',
        )}
        value="reasoning"
      >
        <AccordionTrigger
          className={cn(
            'inline-flex w-auto gap-3 p-[5px] no-underline hover:no-underline',
            'hover:bg-official-gray-900 transition-colors',
            status?.type === 'running' && 'p-0',
          )}
          hideArrow={status?.type === 'running'}
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              animate="visible"
              exit="exit"
              initial="initial"
              key={status?.type}
              transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
              variants={variants}
            >
              <div
                className={cn(
                  'text-official-gray-300 flex items-center gap-1',
                  status?.type === 'running' && 'text-official-gray-200',
                )}
              >
                {renderStatus() && (
                  <div className="size-7 shrink-0 px-1.5">{renderStatus()}</div>
                )}
                <div className="flex items-center gap-1">
                  <span className="text-em-sm">{renderReasoningText()}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </AccordionTrigger>
        <AccordionContent className="bg-official-gray-950 flex flex-col gap-1 rounded-b-lg px-3 pt-2 pb-3 text-sm">
          <span className="text-official-gray-400 break-words whitespace-pre-line">
            {reasoning}
          </span>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export const GeneratedFiles = ({ toolCalls }: { toolCalls: ToolCall[] }) => {
  return (
    toolCalls.length > 0 &&
    toolCalls?.some(
      (tool) => !!tool.generatedFiles && tool.generatedFiles.length > 0,
    ) && (
      <div className="mt-4 space-y-1 py-4 pt-1.5">
        <span className="text-official-gray-400 text-em-sm">
          Generated Files
        </span>
        <div className="flex flex-wrap items-start gap-4 rounded-md">
          {toolCalls.map((tool) => {
            if (!tool.generatedFiles || !tool.generatedFiles.length)
              return null;
            return (
              <FileList
                className="mt-2"
                files={tool.generatedFiles.map((file) => ({
                  name: file.name,
                  path: file.path,
                  type: file.type,
                  size: file?.size,
                  content: file?.content,
                  blob: file?.blob,
                  id: file.id,
                  extension: file.extension,
                  mimeType: file.mimeType,
                  url: file.url,
                }))}
                key={tool.name}
              />
            );
          })}
        </div>
      </div>
    )
  );
};

const getStepIcon = (type: string) => {
  switch (type) {
    case 'llm_payload':
    case 'llm_response':
      return <AisIcon className="h-4 w-4" />;
    case 'tool_call':
    case 'tool_response':
      return <ToolsIcon className="h-4 w-4" />;
    default:
      return <Zap className="h-4 w-4" />;
  }
};

export type LLMPayloadTracingInfo = {
  functions: [
    {
      description: string;
      name: string;
      parameters: {
        properties: Record<string, any>;
        required: string[];
        type: 'object';
      };
      tool_router_key: string;
    },
  ];
  max_tokens: number;
  messages: [
    {
      content:
        | string
        | { text: string; type: string }[]
        | { function_call: { arguments: string; id: string; name: string } };
      role: 'system' | 'user' | 'assistant' | 'function';
      name?: string;
    },
  ];
  model: string;
  stream: boolean;
  temperature: number;
  top_p: number;
};

export type LLMResponseTracingInfo = {
  function_calls: {
    arguments: {
      url: string;
    };
    id: string;
    index: number;
    name: string;
    response: null;
    tool_router_key: string;
    type: null;
  }[];
  json: {};
  response: '';
};

export type ToolCallTracingInfo = {
  function: string;
  tool: string;
};

export type ToolResponseTracingInfo = {
  function: string;
  response: string;
};
export type InvoiceRequestSentTracingInfo = {
  provider: string;
  tool: string;
  tool_author: string;
  tool_description: string;
  usage_type: string;
};

export type InvoiceReceivedTracingInfo = {
  address: {
    address_id: string;
    network: string;
  };
  expiration: string;
  has_tool_data: boolean;
  invoice_date: string;
  provider: string;
  requester: string;
  tool_key: string;
  usage_type: string;
};

export type InvoicePaidTracingInfo = {
  has_tool_data: boolean;
  invoice_date: string;
  invoice_id: string;
  paid_date: string;
  payment_details: {
    date_paid: string;
    payment_status: string;
    transaction_hash: string;
  };
  provider: string;
  requester: string;
  status: string;
  tool_data_keys: string[];
  tool_data_size: number;
  tool_key: string;
  tool_price: string;
  usage_type: string;
};

type TracingNode = MessageTrace & { children: TracingNode[] };
export function TracingDialog({
  open,
  onOpenChange,
  parentMessageId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentMessageId: string;
}) {
  const auth = useAuth((state) => state.auth);
  const [selectedTrace, setSelectedTrace] = useState<MessageTrace | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const { t } = useTranslation();

  const { data: tracingData, isLoading: isTracingLoading } =
    useGetMessageTraces(
      {
        nodeAddress: auth?.node_address ?? '',
        token: auth?.api_v2_key ?? '',
        messageId: parentMessageId,
      },
      { enabled: open && !!parentMessageId },
    );

  useEffect(() => {
    if (open && tracingData && tracingData.length > 0) {
      setSelectedTrace(tracingData[0]);
      setShowRaw(false);
    }
  }, [open, tracingData]);

  const tracesTree = useMemo(() => {
    if (!tracingData) return [] as TracingNode[];
    const map = new Map<number, TracingNode>();
    const roots: TracingNode[] = [];
    tracingData.forEach((t) => {
      map.set(t.id, { ...t, children: [] });
    });
    tracingData.forEach((t) => {
      const info = t.trace_info as any;
      const parentId = info?.parent_id ?? info?.parent_trace_id;
      if (parentId && map.has(parentId)) {
        map.get(parentId)!.children.push(map.get(t.id)!);
      } else {
        roots.push(map.get(t.id)!);
      }
    });
    return roots;
  }, [tracingData]);

  const renderTraceTree = (nodes: TracingNode[], level = 0) =>
    nodes.map((node, idx) => {
      const isLast = idx === nodes.length - 1;
      return (
        <div
          key={node.id}
          style={{ paddingLeft: level * 12 }}
          className="flex items-center"
        >
          <Button
            variant="tertiary"
            className={cn(
              'py-2text-white relative mb-1 h-auto w-full justify-start p-0 py-2 hover:bg-transparent',
              selectedTrace?.id === node.id
                ? 'text-white'
                : 'text-official-gray-400',
            )}
            rounded="lg"
            onClick={() => {
              setSelectedTrace(node);
              setShowRaw(false);
            }}
          >
            <div className="mr-2 flex flex-col items-center">
              <div
                className={cn(
                  'flex size-8 items-center justify-center rounded-full',
                  selectedTrace?.id === node.id
                    ? 'bg-cyan-900/90'
                    : 'bg-cyan-900/50',
                )}
              >
                {getStepIcon(node.trace_name)}
              </div>
              {!isLast && (
                <div
                  className="absolute top-[38px] left-[15px] bg-cyan-700"
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 21,
                    marginTop: 2,
                    borderRadius: 1,
                    opacity: 0.5,
                  }}
                />
              )}
            </div>
            <div className="flex w-full items-start space-x-3">
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate text-sm font-medium">
                  {formatText(node.trace_name)}
                </div>
              </div>
            </div>
          </Button>
          {node.children &&
            node.children.length > 0 &&
            renderTraceTree(node.children, level + 1)}
        </div>
      );
    });

  const renderContentByType = (type: string, info: Record<string, any>) => {
    switch (type) {
      case 'llm_payload': {
        const data = info as LLMPayloadTracingInfo;
        return (
          <div className="flex flex-col gap-5">
            {data.messages && data.messages.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-base font-medium text-white">Messages</h4>
                {data.messages.map((message, index) => (
                  <div
                    key={index}
                    className="border-official-gray-780 rounded-md border p-2"
                  >
                    <div className="flex flex-col items-start gap-1">
                      <div className="inline-flex items-center gap-2 rounded-full p-2">
                        {message.role === 'user' ? (
                          <User className="size-3" />
                        ) : message.role === 'assistant' ? (
                          <AisIcon className="size-3" />
                        ) : message.role === 'function' ? (
                          <ToolsIcon className="size-3" />
                        ) : message.role === 'system' ? (
                          <Cpu className="size-3" />
                        ) : (
                          <Zap className="size-3" />
                        )}
                        <span className="text-official-gray-400 text-xs capitalize">
                          {message.role}
                        </span>
                      </div>
                      <div className="w-full flex-1 pl-2">
                        <p className="text-official-gray-200 text-sm leading-relaxed break-words">
                          {(() => {
                            if (typeof message.content === 'string') {
                              return (
                                <div className="max-h-[280px] space-y-2 overflow-y-auto">
                                  {message.content}
                                </div>
                              );
                            }

                            if (Array.isArray(message.content)) {
                              return (
                                <div className="space-y-2">
                                  {message.content.map(
                                    (item: any, index: number) => (
                                      <div key={index} className="mb-2">
                                        <div className="max-h-[280px] space-y-2 overflow-y-auto">
                                          <p className="text-official-gray-200 text-sm">
                                            {item.text}
                                          </p>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              );
                            }

                            if (
                              message.content?.function_call &&
                              message.role === 'function'
                            ) {
                              return (
                                <PrettyJsonPrint
                                  json={JSON.parse(
                                    message.content as unknown as any,
                                  )}
                                  className="text-sm"
                                />
                              );
                            }

                            if (
                              'function_call' in message &&
                              message.function_call &&
                              message.role === 'assistant'
                            ) {
                              return (
                                <PrettyJsonPrint
                                  json={message.function_call}
                                  className="text-sm"
                                />
                              );
                            }

                            return 'No content available';
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {(data.functions ?? []).length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-white">
                  Tool Calls
                </h3>
                <div className="border-official-gray-780 bg-official-gray-900 rounded-md border p-3">
                  {data.functions.map((func) => (
                    <div className="flex items-start gap-3" key={func.name}>
                      <ToolsIcon className="mt-0.5 h-5 w-5 text-cyan-500" />
                      <div>
                        <p className="text-sm font-medium">{func.name}</p>
                        <p className="text-official-gray-400 text-sm">
                          {func.description}
                        </p>
                        {Object.entries(func.parameters.properties).length >
                          0 && (
                          <div className="mt-2 flex flex-wrap items-center gap-1">
                            <p className="text-official-gray-400 text-xs">
                              Parameters:
                            </p>
                            {Object.entries(func.parameters.properties).map(
                              ([key, value]) => (
                                <span
                                  className="text-official-gray-400 text-xs"
                                  key={key}
                                >
                                  {key}
                                </span>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="mb-2 text-sm font-medium text-white">
                Model Configuration
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-official-gray-900 border-official-gray-780 rounded-md border p-3">
                  <p className="text-official-gray-400 text-xs">Model</p>
                  <p className="text-sm">{data.model}</p>
                </div>
                <div className="bg-official-gray-900 border-official-gray-780 rounded-md border p-3">
                  <p className="text-official-gray-400 text-xs">Max Tokens</p>
                  <p className="text-sm">{data.max_tokens}</p>
                </div>
                <div className="bg-official-gray-900 border-official-gray-780 rounded-md border p-3">
                  <p className="text-official-gray-400 text-xs">Temperature</p>
                  <p className="text-sm">{data.temperature}</p>
                </div>
                <div className="bg-official-gray-900 border-official-gray-780 rounded-md border p-3">
                  <p className="text-official-gray-400 text-xs">Top P</p>
                  <p className="text-sm">{data.top_p}</p>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'llm_response': {
        const data = info as LLMResponseTracingInfo;
        return (
          <div className="flex flex-col gap-5">
            {data.function_calls && data.function_calls.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-white">
                  Tool Calls
                </h3>
                <div className="border-official-gray-780 bg-official-gray-900 rounded-md border p-3">
                  {data.function_calls.map((func) => (
                    <div className="flex items-start gap-3" key={func.name}>
                      <ToolsIcon className="mt-0.5 h-5 w-5 text-cyan-500" />
                      <div>
                        <p className="text-sm font-medium">{func.name}</p>
                        <p className="text-official-gray-400 text-xs">
                          <span className="text-official-gray-200 font-medium">
                            Tool Router Key:{' '}
                          </span>
                          {func.tool_router_key}
                        </p>
                        {Object.entries(func.arguments).length > 0 && (
                          <div className="mt-2 flex flex-col gap-0.5">
                            <p className="text-official-gray-400 text-xs">
                              Parameters
                            </p>
                            {Object.entries(func.arguments).map(
                              ([key, value]) => (
                                <span
                                  className="text-official-gray-400 text-sm"
                                  key={key}
                                >
                                  {key}:{' '}
                                  <span className="text-official-gray-200 text-sm">
                                    {value}
                                  </span>
                                </span>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.response && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-white">
                  Response
                </h3>
                <div className="border-official-gray-780 bg-official-gray-900 rounded-md border p-3 text-sm">
                  {data.response}
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'tool_call': {
        const data = info as ToolCallTracingInfo;
        return (
          <div className="border-official-gray-780 bg-official-gray-900 rounded-md border p-3">
            <div className="flex items-start gap-3">
              <ToolsIcon className="mt-0.5 h-5 w-5 text-cyan-500" />
              <div>
                <p className="text-sm font-medium">{data.function}</p>
                <p className="text-official-gray-400 text-xs">
                  <span className="text-official-gray-200 font-medium">
                    Tool Router Key:{' '}
                  </span>
                  {data.tool}
                </p>
              </div>
            </div>
          </div>
        );
      }
      case 'tool_response': {
        const data = info as ToolResponseTracingInfo;
        return (
          <div className="border-official-gray-780 bg-official-gray-900 space-y-2 overflow-hidden rounded-md border p-3">
            <p className="text-sm font-medium">{data.function}</p>

            <div className="text-official-gray-400 overflow-auto text-xs">
              <PrettyJsonPrint json={data.response} />
            </div>
          </div>
        );
      }
      case 'invoice_request_sent': {
        const data = info as InvoiceRequestSentTracingInfo;
        return (
          <div className="border-official-gray-780 bg-official-gray-900 space-y-2 overflow-hidden rounded-md border p-3">
            <p className="text-sm font-medium">{data.tool}</p>
            <p className="text-official-gray-400 text-xs">
              <span className="text-official-gray-200 font-medium">
                Author:{' '}
              </span>
              {data.tool_author}
            </p>
            <p className="text-official-gray-400 text-xs">
              <span className="text-official-gray-200 font-medium">
                Description:{' '}
              </span>
              {data.tool_description}
            </p>
            <p className="text-official-gray-400 text-xs">
              <span className="text-official-gray-200 font-medium">
                Provider:{' '}
              </span>
              {data.provider}
            </p>
            <p className="text-official-gray-400 text-xs">
              <span className="text-official-gray-200 font-medium">
                Usage Type:{' '}
              </span>
              {data.usage_type}
            </p>
          </div>
        );
      }
      case 'invoice_received': {
        const data = info as InvoiceReceivedTracingInfo;
        return (
          <div className="border-official-gray-780 bg-official-gray-900 space-y-2 overflow-hidden rounded-md border p-3">
            <p className="text-sm font-medium">{data.tool_key}</p>
            <p className="text-official-gray-400 text-xs">
              <span className="text-official-gray-200 font-medium">
                Provider:{' '}
              </span>
              {data.provider}
            </p>
            <p className="text-official-gray-400 text-xs">
              <span className="text-official-gray-200 font-medium">
                Requester:{' '}
              </span>
              {data.requester}
            </p>
            <p className="text-official-gray-400 text-xs">
              <span className="text-official-gray-200 font-medium">
                Invoice Date:{' '}
              </span>
              {format(new Date(data.invoice_date), 'yyyy-MM-dd HH:mm:ss')}
            </p>
            <p className="text-official-gray-400 text-xs">
              <span className="text-official-gray-200 font-medium">
                Expiration:{' '}
              </span>
              {format(new Date(data.expiration), 'yyyy-MM-dd HH:mm:ss')}
            </p>
            <p className="text-official-gray-400 text-xs">
              <span className="text-official-gray-200 font-medium">
                Usage Type:{' '}
              </span>
              {data.usage_type}
            </p>
            <p className="text-official-gray-400 text-xs">
              <span className="text-official-gray-200 font-medium">
                Has Tool Data:{' '}
              </span>
              {String(data.has_tool_data)}
            </p>
            <div className="text-official-gray-400 text-xs">
              <p className="text-official-gray-200 font-medium">Address</p>
              <p>
                ID:{' '}
                <span className="text-official-gray-200">
                  {data.address.address_id}
                </span>
              </p>
              <p>
                Network:{' '}
                <span className="text-official-gray-200">
                  {data.address.network}
                </span>
              </p>
            </div>
          </div>
        );
      }
      case 'invoice_paid': {
        const data = info as InvoicePaidTracingInfo;
        return (
          <div className="border-official-gray-780 bg-official-gray-900 space-y-2 overflow-hidden rounded-md border p-3">
            <p className="text-sm font-medium">{data.tool_key}</p>
            <p className="text-official-gray-400 text-xs">
              <span className="text-official-gray-200 font-medium">
                Provider:{' '}
              </span>
              {data.provider}
            </p>
            <p className="text-official-gray-400 text-xs">
              <span className="text-official-gray-200 font-medium">
                Requester:{' '}
              </span>
              {data.requester}
            </p>
            <p className="text-official-gray-400 text-xs">
              <span className="text-official-gray-200 font-medium">
                Status:{' '}
              </span>
              {data.status}
            </p>
            <p className="text-official-gray-400 text-xs">
              <span className="text-official-gray-200 font-medium">
                Invoice ID:{' '}
              </span>
              {data.invoice_id}
            </p>
            <p className="text-official-gray-400 text-xs">
              <span className="text-official-gray-200 font-medium">
                Invoice Date:{' '}
              </span>
              {format(new Date(data.invoice_date), 'yyyy-MM-dd HH:mm:ss')}
            </p>
            <p className="text-official-gray-400 text-xs">
              <span className="text-official-gray-200 font-medium">
                Paid Date:{' '}
              </span>
              {format(new Date(data.paid_date), 'yyyy-MM-dd HH:mm:ss')}
            </p>
            <p className="text-official-gray-400 text-xs">
              <span className="text-official-gray-200 font-medium">
                Has Tool Data:{' '}
              </span>
              {String(data.has_tool_data)}
            </p>
            <p className="text-official-gray-400 text-xs">
              <span className="text-official-gray-200 font-medium">
                Tool Price:{' '}
              </span>
              {data.tool_price}
            </p>
            <p className="text-official-gray-400 text-xs">
              <span className="text-official-gray-200 font-medium">
                Usage Type:{' '}
              </span>
              {data.usage_type}
            </p>
            <div className="text-official-gray-400 text-xs">
              <p className="text-official-gray-200 font-medium">
                Payment Details
              </p>
              <p>
                Status:{' '}
                <span className="text-official-gray-200">
                  {data.payment_details.payment_status}
                </span>
              </p>
              <p>
                Tx Hash:{' '}
                <span className="text-official-gray-200">
                  {data.payment_details.transaction_hash}
                </span>
              </p>
            </div>
            {data.tool_data_keys.length > 0 && (
              <div className="text-official-gray-400 text-xs">
                <p className="text-official-gray-200 font-medium">
                  Tool Data Keys ({data.tool_data_size})
                </p>
                <p>{data.tool_data_keys.join(', ')}</p>
              </div>
            )}
          </div>
        );
      }
      default: {
        return <PrettyJsonPrint json={info} />;
      }
    }
  };

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="max-w-3xl p-0 pt-4" side="right">
        <SheetHeader className="border-official-gray-750 border-b p-4 pt-0">
          <SheetTitle>{t('chat.tracing.title')}</SheetTitle>
        </SheetHeader>
        <div className="flex size-full divide-x">
          <ScrollArea className="bg-official-gray-900 h-[calc(100vh-45px)] w-1/3 px-4 [&>div>div]:!block">
            <div className="flex items-center justify-between py-3">
              <h3 className="text-base font-semibold text-white">
                Activity Steps
              </h3>
              <p className="text-official-gray-400 mt-1 text-sm">
                {tracingData?.length} steps
              </p>
            </div>
            {isTracingLoading ? (
              <Loader2 className="mx-auto mt-4 h-5 w-5 animate-spin" />
            ) : (
              <div className="flex flex-col py-2">
                {renderTraceTree(tracesTree)}
              </div>
            )}
          </ScrollArea>
          <ScrollArea className="h-[calc(100vh-45px)] w-full max-w-2/3 px-3 [&>div>div]:!block">
            {selectedTrace ? (
              <div className="size-full space-y-4 overflow-hidden py-4">
                <div className="flex items-center justify-between">
                  <p className="text-base font-medium text-white">
                    {formatText(selectedTrace.trace_name)}
                  </p>
                  <Button
                    onClick={() => setShowRaw((prev) => !prev)}
                    size="sm"
                    variant="tertiary"
                    rounded="lg"
                  >
                    {showRaw ? 'Formatted View' : 'Raw JSON'}
                  </Button>
                </div>
                {showRaw ? (
                  <PrettyJsonPrint json={selectedTrace.trace_info} />
                ) : (
                  renderContentByType(
                    selectedTrace.trace_name,
                    selectedTrace.trace_info,
                  )
                )}
              </div>
            ) : (
              <p className="text-official-gray-400 py-4 text-center text-sm">
                {t('common.selectItem')}
              </p>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
