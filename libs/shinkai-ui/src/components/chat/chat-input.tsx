import * as React from 'react';

import { cn } from '../../utils';

export interface ChatInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onSend?: () => void;
}

const ChatInputBase = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, onSend, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex max-h-[42vh] min-h-[60px] w-full resize-none overflow-y-auto break-all border-none bg-transparent px-3 py-2 text-sm leading-normal placeholder:text-gray-100 focus:outline-none focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        id="chat-input"
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSend?.();
          }
        }}
        ref={ref}
        {...props}
      />
    );
  },
);

ChatInputBase.displayName = 'ChatInput';
export const ChatInput = React.memo(ChatInputBase);
