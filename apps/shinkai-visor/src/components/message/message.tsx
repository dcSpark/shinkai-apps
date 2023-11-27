import { ChatConversationMessage } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/types';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { Copy } from 'lucide-react';

import { cn } from '../../helpers/cn-utils';
import { sendMessage } from '../../service-worker/communication/internal';
import { ServiceWorkerInternalMessageType } from '../../service-worker/communication/internal/types';
import { FileList } from '../file-list/file-list';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';

type MessageProps = {
  message: ChatConversationMessage;
};

export const Message = ({ message }: MessageProps) => {
  const copyToClipboard = () => {
    sendMessage({
      type: ServiceWorkerInternalMessageType.CopyToClipboard,
      data: { content: message.content },
    });
  };
  return (
    <div
      className={cn(
        'flex flex-row',
        message.isLocal
          ? 'ml-0 mr-auto flex-row space-x-1'
          : 'ml-auto mr-0 flex-row-reverse space-x-1 space-x-reverse',
      )}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage
          alt={message.isLocal ? message.inboxId : 'Shinkai AI'}
          src={message.sender.avatar}
        />
        <AvatarFallback className="h-8 w-8" />
      </Avatar>
      <div
        className={cn(
          'text-foreground group relative mt-1 flex flex-col space-y-2 rounded-lg bg-transparent px-2.5 py-3 text-sm min-w-[75px]',
          message.isLocal
            ? 'rounded-tl-none border border-slate-800'
            : 'rounded-tr-none border-none bg-[rgba(217,217,217,0.04)]',
        )}
      >
        <Button
          className="absolute right-2 top-2 hidden group-hover:flex"
          onClick={() => copyToClipboard()}
          size="icon"
          variant="ghost"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <MarkdownPreview
          className="wmde-markdown-var"
          source={message.content}
          wrapperElement={{ 'data-color-mode': 'dark' }}
        />
        {!!message.fileInbox?.files?.length && (
          <FileList
            actions={[]}
            className="w-[200px]"
            files={message.fileInbox?.files}
          ></FileList>
        )}
      </div>
    </div>
  );
};
