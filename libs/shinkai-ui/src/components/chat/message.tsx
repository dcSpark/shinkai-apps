import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { motion } from 'framer-motion';
import { Edit3, RotateCcw } from 'lucide-react';
import React from 'react';

import { appIcon } from '../../assets';
import { ChatConversationMessage, copyToClipboard } from '../../helpers';
import { useMeasure } from '../../hooks/use-measure';
import { cn } from '../../utils';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import { Button } from '../button';
import { CopyToClipboardIcon } from '../copy-to-clipboard-icon';
import { DotsLoader } from '../dots-loader';
import { MarkdownPreview } from '../markdown-preview';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '../tooltip';
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
  handleRegenerate?: () => void;
};

export const Message = ({
  message,
  isPending,
  handleRegenerate,
}: MessageProps) => {
  const { t } = useTranslation();

  const [messageBoxRef, { height }] = useMeasure<HTMLDivElement>();
  return (
    <motion.div animate={{ height: height ?? 'auto' }}>
      <div className="group pb-10" ref={messageBoxRef}>
        <div
          className={cn(
            'group flex flex-row space-x-2',
            message.isLocal
              ? 'ml-auto mr-0 flex-row-reverse space-x-reverse'
              : 'ml-0 mr-auto flex-row items-end',
          )}
        >
          <Avatar className="h-8 w-8">
            {message.isLocal ? (
              <AvatarImage alt={''} src={message.sender.avatar} />
            ) : (
              <img alt="Shinkai AI" src={appIcon} />
            )}
            <AvatarFallback className="h-8 w-8" />
          </Avatar>

          <div
            className={cn(
              'relative mt-1 flex flex-col rounded-lg bg-black/40 px-3.5 pt-3 text-sm text-white',
              message.isLocal
                ? 'rounded-tr-none bg-gray-300'
                : 'rounded-bl-none border-none bg-gray-200',
              !message.content ? 'pb-3' : 'pb-4',
            )}
          >
            <div
              className={cn(
                'duration-30 absolute -bottom-[34px] right-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 group-hover:transition-opacity',
                isPending ? 'hidden' : 'flex',
              )}
            >
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

              {!message.isLocal && (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={cn(
                          'text-gray-80 flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-transparent transition-colors hover:bg-gray-300 hover:text-white [&>svg]:h-3 [&>svg]:w-3',
                        )}
                        onClick={handleRegenerate}
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
            </div>
            {message.content ? (
              <MarkdownPreview
                components={{
                  a: ({ node, ...props }) => (
                    // eslint-disable-next-line jsx-a11y/anchor-has-content
                    <a {...props} target="_blank" />
                  ),
                }}
                source={extractErrorPropertyOrContent(
                  isPending ? message.content + ' ...' : message.content,
                  'error_message',
                )}
              />
            ) : (
              <DotsLoader className="pt-1" />
            )}
            {!!message.fileInbox?.files?.length && (
              <FileList
                className="mt-2 min-w-[200px] max-w-[400px]"
                files={message.fileInbox?.files}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
