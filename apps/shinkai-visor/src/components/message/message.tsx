import { extractErrorPropertyOrContent } from '@shinkai_network/shinkai-message-ts/utils';
import { ChatConversationMessage } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/types';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  CopyToClipboardIcon,
  MarkdownPreview,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import React from 'react';

import shinkaiMiniLogo from '../../assets/icons/shinkai-min.svg';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { FileList } from '../file-list/file-list';

type MessageProps = {
  message: ChatConversationMessage;
};
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // Fallback for browsers where the Clipboard API is not supported
    const textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.innerText = text;
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
}

export const Message = ({ message }: MessageProps) => {
  return (
    <div
      className={cn(
        'flex flex-row space-x-2',
        message.isLocal
          ? 'ml-auto mr-0 flex-row-reverse space-x-reverse'
          : 'ml-0 mr-auto flex-row items-end',
      )}
    >
      <Avatar className="h-8 w-8">
        {message.isLocal ? (
          <AvatarImage alt={''} src={message.sender.avatar} />
        ) : (
          <img alt="Shinkai AI" src={srcUrlResolver(shinkaiMiniLogo)} />
        )}
        <AvatarFallback className="h-8 w-8" />
      </Avatar>
      <div
        className={cn(
          'group relative mt-1 flex flex-col overflow-hidden rounded-lg bg-transparent px-2.5 py-3 text-sm text-white',
          message.isLocal
            ? 'rounded-tr-none bg-gray-300'
            : 'rounded-bl-none border-none bg-gray-200',
        )}
      >
        {message.isLocal ? null : (
          <CopyToClipboardIcon
            className="duration-30 absolute right-2 top-2 bg-gray-300 opacity-0 group-hover:opacity-100 group-hover:transition-opacity"
            onCopyClipboard={() => {
              copyToClipboard(
                extractErrorPropertyOrContent(message.content, 'error_message'),
              );
            }}
            string={extractErrorPropertyOrContent(
              message.content,
              'error_message',
            )}
          />
        )}
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
            actions={[]}
            className="mt-2 w-full min-w-[200px]"
            files={message.fileInbox?.files}
          />
        )}
      </div>
    </div>
  );
};
