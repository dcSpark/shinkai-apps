import React from 'react';

import { appIcon } from '../../assets';
import { ChatConversationMessage, copyToClipboard } from '../../helpers';
import { cn } from '../../utils';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import { CopyToClipboardIcon } from '../copy-to-clipboard-icon';
import { MarkdownPreview } from '../markdown-preview';
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
  } catch (error) {
    /* ignore */
  }
  return String(content);
};

type MessageProps = {
  message: ChatConversationMessage;
};

export const Message = ({ message }: MessageProps) => {
  return (
    <div className="group pb-10">
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
            'relative mt-1 flex flex-col rounded-lg bg-black/40 px-3 py-2 text-sm text-white',
            message.isLocal
              ? 'rounded-tr-none bg-gray-300'
              : 'rounded-bl-none border-none bg-gray-200',
          )}
        >
          <div
            className={cn(
              'duration-30 absolute -bottom-8 right-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 group-hover:transition-opacity',
              '',
            )}
          >
            <CopyToClipboardIcon
              className={cn(
                'text-gray-80 h-7 w-7 border border-gray-200 bg-transparent [&>svg]:h-3 [&>svg]:w-3',
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
          </div>
          <MarkdownPreview
            components={{
              a: ({ node, ...props }) => (
                // eslint-disable-next-line jsx-a11y/anchor-has-content
                <a {...props} target="_blank" />
              ),
            }}
            source={extractErrorPropertyOrContent(
              message.content,
              'error_message',
            )}
          />
          {!!message.fileInbox?.files?.length && (
            <FileList
              className="mt-2 min-w-[200px] max-w-[400px]"
              files={message.fileInbox?.files}
            />
          )}
        </div>
      </div>
    </div>
  );
};
