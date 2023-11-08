import { ChatConversationMessage } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/types';
import MarkdownPreview from '@uiw/react-markdown-preview';

import { cn } from '../../helpers/cn-utils';
import { FileList } from '../file-list/file-list';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

type MessageProps = {
  message: ChatConversationMessage;
};

export const Message = ({ message }: MessageProps) => {
  return (
    <div
      className={cn(
        'flex flex-row',
        message.isLocal
          ? 'ml-0 mr-auto flex-row space-x-1'
          : 'ml-auto mr-0 flex-row-reverse space-x-1 space-x-reverse'
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
          'mt-1 rounded-lg bg-transparent text-foreground px-2.5 py-3 text-sm flex flex-col space-y-2',
          message.isLocal
            ? 'rounded-tl-none border border-slate-800'
            : 'rounded-tr-none border-none bg-[rgba(217,217,217,0.04)]'
        )}
      >
        <MarkdownPreview
          className="wmde-markdown-var"
          source={message.content}
          wrapperElement={{ 'data-color-mode': 'dark' }}
        />
        {!!message.fileInbox?.files?.length && (
          <FileList actions={[]} className="w-[200px]" files={message.fileInbox?.files}></FileList>
        )}
      </div>
    </div>
  );
};
