import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Edit3, RotateCcw } from 'lucide-react';
import { InfoCircleIcon } from 'primereact/icons/infocircle';
import React, { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { appIcon } from '../../assets';
import { ChatConversationMessage, copyToClipboard } from '../../helpers';
import { useMeasure } from '../../hooks/use-measure';
import { cn } from '../../utils';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import { Button } from '../button';
import { CopyToClipboardIcon } from '../copy-to-clipboard-icon';
import { DotsLoader } from '../dots-loader';
import { Form, FormField } from '../form';
import { MarkdownPreview } from '../markdown-preview';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '../tooltip';
import { ChatInputArea } from './chat-input-area';
import { FileList } from './files-preview';

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

type MessageProps = {
  isPending?: boolean;
  message: ChatConversationMessage;
  handleRetryMessage?: () => void;
  disabledRetry?: boolean;
  disabledEdit?: boolean;
  handleEditMessage?: (message: string, workflowName?: string) => void;
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

export const editMessageFormSchema = z.object({
  message: z.string().min(1),
});

type EditMessageFormSchema = z.infer<typeof editMessageFormSchema>;

export const Message = ({
  message,
  isPending,
  handleRetryMessage,
  disabledRetry,
  disabledEdit,
  handleEditMessage,
}: MessageProps) => {
  const { t } = useTranslation();
  const [rowElementRef, { width: rowWidth }] = useMeasure();

  const [editing, setEditing] = useState(false);
  const editMessageForm = useForm<EditMessageFormSchema>({
    resolver: zodResolver(editMessageFormSchema),
    defaultValues: {
      message: message.content,
    },
  });

  const { message: currentMessage } = editMessageForm.watch();

  const onSubmit = async (data: z.infer<typeof editMessageFormSchema>) => {
    handleEditMessage?.(data.message, message.workflowName);
    setEditing(false);
  };

  useEffect(() => {
    editMessageForm.reset({ message: message.content });
  }, [editMessageForm, message.content]);

  return (
    <motion.div
      animate="rest"
      className="pb-10"
      initial="rest"
      whileHover="hover"
    >
      <div
        className={cn(
          'flex flex-row space-x-2',
          message.isLocal
            ? 'ml-auto mr-0 flex-row-reverse space-x-reverse'
            : 'ml-0 mr-auto flex-row items-end',
        )}
        ref={rowElementRef}
      >
        <Avatar className="h-8 w-8">
          {message.isLocal ? (
            <AvatarImage alt={''} src={message.sender.avatar} />
          ) : (
            <img alt="Shinkai AI" src={appIcon} />
          )}
          <AvatarFallback className="h-8 w-8" />
        </Avatar>
        <motion.div
          className={cn(
            'relative mt-1 flex flex-col rounded-lg bg-black/40 px-3.5 pt-3 text-sm text-white',
            message.isLocal
              ? 'rounded-tr-none bg-gray-300'
              : 'rounded-bl-none border-none bg-gray-200',
            !message.content ? 'pb-3' : 'pb-4',
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
                            <div className="flex items-center gap-1 text-xs text-gray-100">
                              <InfoCircleIcon className="h-3 w-3 text-gray-100" />
                              <span>{t('chat.editMessage.warning')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                className="min-w-[90px] rounded-lg"
                                onClick={() => setEditing(false)}
                                size="sm"
                                variant="outline"
                              >
                                {t('common.cancel')}
                              </Button>
                              <Button
                                className="min-w-[90px] rounded-lg"
                                disabled={!currentMessage}
                                onClick={editMessageForm.handleSubmit(onSubmit)}
                                size="sm"
                              >
                                {t('common.send')}
                              </Button>
                            </div>
                          </div>
                        }
                        onChange={field.onChange}
                        onSubmit={editMessageForm.handleSubmit(onSubmit)}
                        setInitialValue={message.content}
                        value={field.value}
                      />
                    )}
                  />
                </div>
              </form>
            </Form>
          ) : (
            <Fragment>
              {!isPending && (
                <motion.div
                  className={cn(
                    'duration-30 absolute -top-[18px] right-1 flex items-center gap-1.5 text-xs text-gray-100 opacity-0 group-hover:opacity-100 group-hover:transition-opacity',
                  )}
                  variants={actionBar}
                >
                  {format(new Date(message?.scheduledTime ?? ''), 'p')}
                </motion.div>
              )}
              {!isPending && (
                <motion.div
                  className={cn(
                    'duration-30 absolute -bottom-[34px] right-1 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 group-hover:transition-opacity',
                  )}
                  variants={actionBar}
                >
                  {message.isLocal && !disabledEdit && (
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className={cn(
                              'text-gray-80 flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-transparent transition-colors hover:bg-gray-300 hover:text-white [&>svg]:h-3 [&>svg]:w-3',
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
                    </TooltipProvider>
                  )}
                  {!message.isLocal && !disabledRetry && (
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className={cn(
                              'text-gray-80 flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-transparent transition-colors hover:bg-gray-300 hover:text-white [&>svg]:h-3 [&>svg]:w-3',
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
                    </TooltipProvider>
                  )}
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger>
                        <CopyToClipboardIcon
                          className={cn(
                            'text-gray-80 h-7 w-7 border border-gray-200 bg-transparent hover:bg-gray-300 [&>svg]:h-3 [&>svg]:w-3',
                          )}
                          onCopyClipboard={() => {
                            copyToClipboard(
                              extractErrorPropertyOrContent(
                                message.content,
                                'error_message',
                              ),
                            );
                          }}
                          string={extractErrorPropertyOrContent(
                            message.content,
                            'error_message',
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipPortal>
                        <TooltipContent>
                          <p>{t('common.copy')}</p>
                        </TooltipContent>
                      </TooltipPortal>
                    </Tooltip>
                  </TooltipProvider>
                </motion.div>
              )}
              {message.content ? (
                <div
                  style={{
                    maxWidth: rowWidth ? `${rowWidth - 64}px` : 'auto', // 32 (avatar) + 32 (inner/outer padding)
                    overflow: 'hidden',
                  }}
                >
                  <MarkdownPreview
                    components={{
                      a: ({ node, ...props }) => (
                        // eslint-disable-next-line jsx-a11y/anchor-has-content
                        <a {...props} target="_blank" />
                      ),
                      table: ({ node, ...props }) => (
                        <div className="size-full overflow-x-auto">
                          <table className="w-full" {...props} />
                        </div>
                      ),
                    }}
                    source={
                      isPending
                        ? extractErrorPropertyOrContent(
                            message.content,
                            'error_message',
                          ) + ' ...'
                        : extractErrorPropertyOrContent(
                            message.content,
                            'error_message',
                          )
                    }
                  />
                </div>
              ) : (
                <DotsLoader className="pt-1" />
              )}
              {!!message.fileInbox?.files?.length && (
                <FileList
                  className="mt-2 min-w-[200px] max-w-[400px]"
                  files={message.fileInbox?.files}
                />
              )}
              {!!message.workflowName && (
                <div className="mt-2 flex items-center gap-1.5 border-t pt-1.5">
                  <span className="text-gray-80 text-xs">Workflow:</span>
                  <span className="text-gray-80 text-xs">
                    {message.workflowName}
                  </span>
                </div>
              )}
            </Fragment>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
