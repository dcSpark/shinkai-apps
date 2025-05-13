import * as React from 'react';

import { cn } from '../../utils';

export interface ChatInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onSend?: () => void;
}

export const useAutoResizeTextarea = (
  ref: React.ForwardedRef<HTMLTextAreaElement>,
  value: string | number | readonly string[] | undefined,
  autoResize = true, //later to unify
) => {
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  React.useImperativeHandle(ref, () => textAreaRef.current!);

  React.useEffect(() => {
    const ref = textAreaRef?.current;

    const updateTextareaHeight = () => {
      if (ref && autoResize) {
        ref.style.height = 'auto';
        ref.style.height = ref?.scrollHeight + 'px';
      }
    };

    updateTextareaHeight();

    ref?.addEventListener('input', updateTextareaHeight);
    return () => ref?.removeEventListener('input', updateTextareaHeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return { textAreaRef };
};

const ChatInputBase = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, onSend, onKeyDown, ...props }, ref) => {
    const { textAreaRef } = useAutoResizeTextarea(ref, props.value);

    return (
      <textarea
        className={cn(
          'placeholder:text-official-gray-500 flex max-h-[40vh] min-h-[80px] w-full resize-none overflow-y-auto break-words border-none bg-transparent px-3 py-2 text-base leading-normal focus:outline-none focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        id="chat-input"
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSend?.();
          }
        }}
        ref={textAreaRef}
        spellCheck={false}
        {...props}
      />
    );
  },
);

ChatInputBase.displayName = 'ChatInput';
export const ChatInput = React.memo(ChatInputBase);
