import MarkdownPreview from '@uiw/react-markdown-preview';
import { Paperclip } from 'lucide-react';

import { cn } from '../../helpers/cn-utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

type MessageProps = {
  isLocal: boolean;
  messageContent: string;
  inboxId: string;
  filesInbox?: string;
};

export const Message = ({
  isLocal,
  messageContent,
  inboxId,
  filesInbox,
}: MessageProps) => {
  const getAvatar = () => {
    return isLocal
      ? 'https://ui-avatars.com/api/?name=Me&background=363636&color=fff'
      : 'https://ui-avatars.com/api/?name=S&background=FE6162&color=fff';
  };
  return (
    <div
      className={cn(
        'flex flex-row',
        isLocal
          ? 'ml-0 mr-auto flex-row space-x-1'
          : 'ml-auto mr-0 flex-row-reverse space-x-1 space-x-reverse'
      )}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage alt={isLocal ? inboxId : 'Shinkai AI'} src={getAvatar()} />
        <AvatarFallback className="h-8 w-8" />
      </Avatar>
      <div
        className={cn(
          'mt-1 rounded-lg bg-transparent text-foreground px-2.5 py-3 text-sm flex flex-col space-y-2',
          isLocal
            ? 'rounded-tl-none border border-slate-800'
            : 'rounded-tr-none border-none bg-[rgba(217,217,217,0.04)]'
        )}
      >
        <MarkdownPreview
        className="wmde-markdown-var"
          source={messageContent}
          wrapperElement={{ 'data-color-mode': 'dark' }}
        />
        {filesInbox && <Paperclip className="w-4 h-4"></Paperclip>}
      </div>
    </div>
  );
};
